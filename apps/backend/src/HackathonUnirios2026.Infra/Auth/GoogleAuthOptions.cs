namespace HackathonUnirios2026.Infra.Auth;

public sealed class GoogleAuthOptions
{
    public const string SectionName = "Authentication:Google";

    public string? WebClientId { get; init; }
    public string? AndroidClientId { get; init; }
    public string? IosClientId { get; init; }
    public string[] AdditionalClientIds { get; init; } = [];

    public IReadOnlyCollection<string> GetClientIds()
    {
        return new[] { WebClientId, AndroidClientId, IosClientId }
            .Concat(AdditionalClientIds)
            .Where(clientId => !string.IsNullOrWhiteSpace(clientId))
            .Select(clientId => clientId!)
            .Distinct(StringComparer.Ordinal)
            .ToArray();
    }
}
