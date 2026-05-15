using HackathonUnirios2026.Domain.Entities;

namespace HackathonUnirios2026.Application.Features.Auth;

public interface IJwtTokenIssuer
{
    string CreateToken(ApplicationUser user);
}

public interface IGoogleTokenValidator
{
    Task<GoogleAccount> ValidateAsync(string idToken, CancellationToken ct);
}

public sealed record GoogleAccount(
    string Subject,
    string Email,
    bool EmailVerified,
    string? Name,
    string? Picture);

public sealed class AuthValidationException(string message) : Exception(message);

public sealed class AuthUnauthorizedException(string message, Exception? innerException = null)
    : Exception(message, innerException);
