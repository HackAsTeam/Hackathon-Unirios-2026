using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public sealed class DeleteAccountCommandHandler(
    UserManager<ApplicationUser> userManager) : IRequestHandler<DeleteAccountCommand>
{
    private const int GracePeriodDays = 30;

    public async Task Handle(DeleteAccountCommand cmd, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(cmd.UserId);
        if (user is null)
        {
            throw new AuthUnauthorizedException("User not found.");
        }

        // Idempotent: already scheduled, nothing to do.
        if (user.Status == UserStatus.PendingDeletion)
        {
            return;
        }

        if (user.Status is UserStatus.Anonymized or UserStatus.Purged)
        {
            throw new AuthValidationException("Account has already been deleted.");
        }

        var now = DateTime.UtcNow;
        user.Status = UserStatus.PendingDeletion;
        user.DeletedAt = now;
        user.PurgeAfter = now.AddDays(GracePeriodDays);

        // Rotate the security stamp so any SecurityStamp-aware middleware
        // (e.g., cookie auth) invalidates existing sessions immediately.
        // Stateless JWTs issued before this point stay valid until they
        // expire — true revocation requires a token blacklist.
        user.SecurityStamp = Guid.NewGuid().ToString();

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new AuthValidationException(errors);
        }
    }
}
