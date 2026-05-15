using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth;

public static class Login
{
    public record Request(string Email, string Password) : IRequest<Response>;

    public record Response(string UserId, string Email, string? DisplayName, string? AvatarUrl, string Token);

    public sealed class Handler(
        UserManager<ApplicationUser> userManager,
        IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<Request, Response>
    {
        public async Task<Response> Handle(Request req, CancellationToken ct)
        {
            Validate(req);

            var user = await userManager.FindByEmailAsync(req.Email.Trim());
            if (user is null)
            {
                throw new AuthUnauthorizedException("Invalid email or password.");
            }

            if (await userManager.IsLockedOutAsync(user))
            {
                throw new AuthUnauthorizedException("Invalid email or password.");
            }

            if (!await userManager.CheckPasswordAsync(user, req.Password))
            {
                await userManager.AccessFailedAsync(user);
                throw new AuthUnauthorizedException("Invalid email or password.");
            }

            await userManager.ResetAccessFailedCountAsync(user);

            return new Response(user.Id, user.Email!, user.DisplayName, user.AvatarUrl, jwtTokenIssuer.CreateToken(user));
        }

        private static void Validate(Request req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
            {
                throw new AuthValidationException("Email is required.");
            }

            if (string.IsNullOrWhiteSpace(req.Password))
            {
                throw new AuthValidationException("Password is required.");
            }
        }
    }
}
