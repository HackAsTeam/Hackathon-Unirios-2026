using HackathonUnirios2026.Domain.Entities;

namespace HackathonUnirios2026.Domain.Auth;

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

/// <summary>
/// Thrown when a user with <see cref="UserStatus.PendingDeletion"/> attempts to authenticate.
/// The caller should surface the restoration deadline so the user can act before data is purged.
/// </summary>
public sealed class AccountPendingDeletionException(DateTime restoreUntil)
    : Exception($"Account is scheduled for deletion. Restore before {restoreUntil:O}.")
{
    public DateTime RestoreUntil { get; } = restoreUntil;
}
