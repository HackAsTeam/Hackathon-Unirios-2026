using HackathonUnirios2026.Application.Features.Auth.DTOs;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public sealed class SetRoleCommandHandler(
    UserManager<ApplicationUser> userManager,
    IJwtTokenIssuer jwtTokenIssuer) : IRequestHandler<SetRoleCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(SetRoleCommand cmd, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(cmd.UserId)
            ?? throw new AuthValidationException("User not found.");

        // Role is a one-time onboarding choice: once Teacher, it cannot be changed.
        if (user.Role == UserRole.Teacher)
        {
            throw new AuthValidationException("Role has already been set and cannot be changed.");
        }

        if (!Enum.TryParse<UserRole>(cmd.Role, ignoreCase: true, out var role))
        {
            throw new AuthValidationException("Invalid role. Must be 'Student' or 'Teacher'.");
        }

        user.Role = role;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new AuthValidationException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        return new AuthResponse(user.Id, user.Email!, user.DisplayName, user.AvatarUrl, jwtTokenIssuer.CreateToken(user), user.Role.ToString());
    }
}
