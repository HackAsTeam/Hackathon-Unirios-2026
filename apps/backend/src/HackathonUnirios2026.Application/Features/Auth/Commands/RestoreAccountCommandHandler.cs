using HackathonUnirios2026.Application.Features.Auth.DTOs;
using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public sealed class RestoreAccountCommandHandler(
    UserManager<ApplicationUser> userManager,
    IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<RestoreAccountCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RestoreAccountCommand cmd, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(cmd.Email.Trim());

        // Verify credentials before allowing restoration — generic message to avoid enumeration.
        if (user is null || !await userManager.CheckPasswordAsync(user, cmd.Password))
        {
            throw new AuthUnauthorizedException("Invalid credentials.");
        }

        if (user.Status != UserStatus.PendingDeletion)
        {
            throw new AuthValidationException("Account is not scheduled for deletion.");
        }

        // Grace period has elapsed — the purge job may have already run.
        if (user.PurgeAfter.HasValue && user.PurgeAfter.Value < DateTime.UtcNow)
        {
            throw new AuthValidationException("Recovery period has expired. The account can no longer be restored.");
        }

        user.Status = UserStatus.Active;
        user.DeletedAt = null;
        user.PurgeAfter = null;
        user.SecurityStamp = Guid.NewGuid().ToString();

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new AuthValidationException(errors);
        }

        return new AuthResponse(user.Id, user.Email!, user.DisplayName, user.AvatarUrl, jwtTokenIssuer.CreateToken(user), user.Role.ToString());
    }
}
