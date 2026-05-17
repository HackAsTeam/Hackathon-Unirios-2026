using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HackathonUnirios2026.Infra.Jobs;

/// <summary>
/// Runs hourly and anonymizes accounts whose LGPD/GDPR grace period has elapsed.
///
/// Anonymization strategy:
///   - PII fields (name, email, avatar, phone) are overwritten with non-identifiable values.
///   - Academic records (attempts, answers, enrollments) are intentionally KEPT so that
///     historical data and audit trails remain intact with only a pseudonymous user reference.
///   - The email is set to a stable, unique placeholder derived from the user ID so that
///     foreign-key and uniqueness constraints are not violated.
/// </summary>
public sealed class PurgeDeletedAccountsJob(
    IServiceScopeFactory scopeFactory,
    ILogger<PurgeDeletedAccountsJob> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Wait a few seconds after startup so migrations and other
        // hosted services have finished initialising.
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Unhandled error in {Job}", nameof(PurgeDeletedAccountsJob));
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task RunAsync(CancellationToken ct)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var now = DateTime.UtcNow;

        var candidates = await db.Users
            .Where(u => u.Status == UserStatus.PendingDeletion && u.PurgeAfter != null && u.PurgeAfter <= now)
            .ToListAsync(ct);

        if (candidates.Count == 0)
        {
            return;
        }

        logger.LogInformation("Anonymizing {Count} account(s) past their purge deadline.", candidates.Count);

        foreach (var user in candidates)
        {
            await AnonymizeAsync(userManager, user, ct);
        }
    }

    private async Task AnonymizeAsync(UserManager<ApplicationUser> userManager, ApplicationUser user, CancellationToken ct)
    {
        // Use a deterministic, unique placeholder so unique-email constraints are satisfied.
        var placeholder = $"deleted_{user.Id}@deleted.invalid";

        user.Email = placeholder;
        user.NormalizedEmail = placeholder.ToUpperInvariant();
        user.UserName = placeholder;
        user.NormalizedUserName = placeholder.ToUpperInvariant();
        user.DisplayName = "Deleted User";
        user.AvatarUrl = null;
        user.PhoneNumber = null;

        // Remove the password hash so the account can never be authenticated again.
        user.PasswordHash = null;

        // Rotate the security stamp to invalidate any lingering sessions.
        user.SecurityStamp = Guid.NewGuid().ToString();

        user.Status = UserStatus.Anonymized;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            logger.LogWarning("Failed to anonymize user {UserId}: {Errors}", user.Id, errors);
        }
        else
        {
            logger.LogInformation("Anonymized user {UserId}.", user.Id);
        }
    }
}
