using HackathonUnirios2026.Application.Features.Auth.DTOs;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public sealed class RestoreWithGoogleCommandHandler(
    UserManager<ApplicationUser> userManager,
    IGoogleTokenValidator googleTokenValidator,
    IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<RestoreWithGoogleCommand, AuthResponse>
{
    private const string LoginProvider = "Google";

    public async Task<AuthResponse> Handle(RestoreWithGoogleCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.IdToken))
        {
            throw new AuthValidationException("Google idToken is required.");
        }

        var googleAccount = await googleTokenValidator.ValidateAsync(cmd.IdToken, ct);
        if (!googleAccount.EmailVerified)
        {
            throw new AuthUnauthorizedException("Google account email is not verified.");
        }

        var user = await userManager.FindByLoginAsync(LoginProvider, googleAccount.Subject)
            ?? await userManager.FindByEmailAsync(googleAccount.Email);

        if (user is null)
        {
            throw new AuthUnauthorizedException("No account found for this Google identity.");
        }

        if (user.Status != UserStatus.PendingDeletion)
        {
            throw new AuthValidationException("Account is not scheduled for deletion.");
        }

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

        return new AuthResponse(user.Id, user.Email!, user.DisplayName, user.AvatarUrl, jwtTokenIssuer.CreateToken(user), user.Role?.ToString());
    }
}
