using Google.Apis.Auth;
using HackathonUnirios2026.Domain.Auth;
using Microsoft.Extensions.Options;

namespace HackathonUnirios2026.Infra.Auth;

public sealed class GoogleTokenValidator(IOptions<GoogleAuthOptions> options) : IGoogleTokenValidator
{
    public async Task<GoogleAccount> ValidateAsync(string idToken, CancellationToken ct)
    {
        var clientIds = options.Value.GetClientIds();
        if (clientIds.Count == 0)
        {
            throw new InvalidOperationException("At least one Google OAuth client ID must be configured.");
        }

        ct.ThrowIfCancellationRequested();

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = clientIds,
                });

            ct.ThrowIfCancellationRequested();

            return new GoogleAccount(
                payload.Subject,
                payload.Email,
                payload.EmailVerified,
                payload.Name,
                payload.Picture);
        }
        catch (InvalidJwtException ex)
        {
            throw new AuthUnauthorizedException("Invalid Google idToken.", ex);
        }
    }
}
