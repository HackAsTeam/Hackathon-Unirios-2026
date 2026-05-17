using HackathonUnirios2026.Application.Features.Auth.DTOs;
using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public sealed class RegisterCommandHandler(
    UserManager<ApplicationUser> userManager,
    IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<RegisterCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RegisterCommand cmd, CancellationToken ct)
    {
        Validate(cmd);

        var email = cmd.Email.Trim();
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser is not null)
        {
            throw new AuthValidationException("Email is already registered.");
        }

        var role = Enum.TryParse<UserRole>(cmd.Role, ignoreCase: true, out var parsed)
            ? parsed
            : UserRole.Student;

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            LockoutEnabled = true,
            DisplayName = string.IsNullOrWhiteSpace(cmd.DisplayName) ? null : cmd.DisplayName.Trim(),
            Role = role,
        };

        var result = await userManager.CreateAsync(user, cmd.Password);
        if (!result.Succeeded)
        {
            throw new AuthValidationException(string.Join(" ", result.Errors.Select(error => error.Description)));
        }

        return new AuthResponse(user.Id, user.Email!, user.DisplayName, user.AvatarUrl, jwtTokenIssuer.CreateToken(user), user.Role.ToString());
    }

    private static void Validate(RegisterCommand cmd)
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
