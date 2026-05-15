using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth;

public static class GoogleLogin
{
    private const string LoginProvider = "Google";

    public record Request(string IdToken) : IRequest<Response>;

    public record Response(string UserId, string Email, string? DisplayName, string? AvatarUrl, string Token);

    public sealed class Handler(
        UserManager<ApplicationUser> userManager,
        IGoogleTokenValidator googleTokenValidator,
        IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<Request, Response>
    {
        public async Task<Response> Handle(Request req, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(req.IdToken))
            {
                throw new AuthValidationException("Google idToken is required.");
            }

            var googleAccount = await googleTokenValidator.ValidateAsync(req.IdToken, ct);
            if (!googleAccount.EmailVerified)
            {
                throw new AuthUnauthorizedException("Google account email is not verified.");
            }

            var user = await userManager.FindByLoginAsync(LoginProvider, googleAccount.Subject)
                ?? await FindOrCreateUserAsync(googleAccount);

            await EnsureGoogleLoginLinkedAsync(user, googleAccount.Subject);
            await UpdateGoogleProfileAsync(user, googleAccount);

            return new Response(user.Id, user.Email!, user.DisplayName, user.AvatarUrl, jwtTokenIssuer.CreateToken(user));
        }

        private async Task<ApplicationUser> FindOrCreateUserAsync(GoogleAccount googleAccount)
        {
            var existingUser = await userManager.FindByEmailAsync(googleAccount.Email);
            if (existingUser is not null)
            {
                if (!existingUser.EmailConfirmed)
                {
                    throw new AuthUnauthorizedException("Existing account email must be confirmed before linking Google.");
                }

                return existingUser;
            }

            var user = new ApplicationUser
            {
                UserName = googleAccount.Email,
                Email = googleAccount.Email,
                EmailConfirmed = true,
                LockoutEnabled = true,
                DisplayName = googleAccount.Name,
                AvatarUrl = googleAccount.Picture,
            };

            var result = await userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                throw new AuthValidationException(string.Join(" ", result.Errors.Select(error => error.Description)));
            }

            return user;
        }

        private async Task EnsureGoogleLoginLinkedAsync(ApplicationUser user, string providerKey)
        {
            var logins = await userManager.GetLoginsAsync(user);
            if (logins.Any(login => login.LoginProvider == LoginProvider && login.ProviderKey == providerKey))
            {
                return;
            }

            var result = await userManager.AddLoginAsync(user, new UserLoginInfo(LoginProvider, providerKey, LoginProvider));
            if (!result.Succeeded)
            {
                throw new AuthValidationException(string.Join(" ", result.Errors.Select(error => error.Description)));
            }
        }

        private async Task UpdateGoogleProfileAsync(ApplicationUser user, GoogleAccount googleAccount)
        {
            var changed = false;

            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                changed = true;
            }

            if (string.IsNullOrWhiteSpace(user.DisplayName) && !string.IsNullOrWhiteSpace(googleAccount.Name))
            {
                user.DisplayName = googleAccount.Name;
                changed = true;
            }

            if (string.IsNullOrWhiteSpace(user.AvatarUrl) && !string.IsNullOrWhiteSpace(googleAccount.Picture))
            {
                user.AvatarUrl = googleAccount.Picture;
                changed = true;
            }

            if (!changed)
            {
                return;
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new AuthValidationException(string.Join(" ", result.Errors.Select(error => error.Description)));
            }
        }
    }
}
