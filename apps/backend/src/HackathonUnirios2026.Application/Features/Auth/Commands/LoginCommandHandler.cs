using HackathonUnirios2026.Application.Features.Auth.DTOs;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public sealed class LoginCommandHandler(
    UserManager<ApplicationUser> userManager,
    IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<LoginCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(LoginCommand cmd, CancellationToken ct)
    {
        Validate(cmd);

        var user = await userManager.FindByEmailAsync(cmd.Email.Trim());
        if (user is null)
        {
            throw new AuthUnauthorizedException("Invalid email or password.");
        }

        if (user.Status == UserStatus.PendingDeletion)
        {
            throw new AccountPendingDeletionException(user.PurgeAfter!.Value);
        }

        if (user.Status != UserStatus.Active)
        {
            // Anonymized / Purged / Suspended — same generic message to avoid enumeration.
            throw new AuthUnauthorizedException("Invalid email or password.");
        }

        if (await userManager.IsLockedOutAsync(user))
        {
            throw new AuthUnauthorizedException("Invalid email or password.");
        }

        if (!await userManager.CheckPasswordAsync(user, cmd.Password))
        {
            await userManager.AccessFailedAsync(user);
            throw new AuthUnauthorizedException("Invalid email or password.");
        }

        await userManager.ResetAccessFailedCountAsync(user);

        return new AuthResponse(user.Id, user.Email!, user.DisplayName, user.AvatarUrl, jwtTokenIssuer.CreateToken(user), user.Role.ToString());
    }

    private static void Validate(LoginCommand cmd)
    {
        if (string.IsNullOrWhiteSpace(cmd.Email))
        {
            throw new AuthValidationException("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(cmd.Password))
        {
            throw new AuthValidationException("Password is required.");
        }
    }
}
