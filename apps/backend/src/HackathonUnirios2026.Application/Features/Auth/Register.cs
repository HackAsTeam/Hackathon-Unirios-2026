using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth;

public static class Register
{
    public record Request(string Email, string Password, string? DisplayName) : IRequest<Response>;

    public record Response(string UserId, string Email, string? DisplayName, string? AvatarUrl, string Token);

    public sealed class Handler(
        UserManager<ApplicationUser> userManager,
        IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<Request, Response>
    {
        public async Task<Response> Handle(Request req, CancellationToken ct)
        {
            Validate(req);

            var email = req.Email.Trim();
            var existingUser = await userManager.FindByEmailAsync(email);
            if (existingUser is not null)
            {
                throw new AuthValidationException("Email is already registered.");
            }

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                LockoutEnabled = true,
                DisplayName = string.IsNullOrWhiteSpace(req.DisplayName) ? null : req.DisplayName.Trim(),
            };

            var result = await userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded)
            {
                throw new AuthValidationException(string.Join(" ", result.Errors.Select(error => error.Description)));
            }

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
