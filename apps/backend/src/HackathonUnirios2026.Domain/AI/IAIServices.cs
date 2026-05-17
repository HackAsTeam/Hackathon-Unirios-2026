using System.Text.Json;

namespace HackathonUnirios2026.Domain.AI;

public interface IGeminiClient
{
    Task<GeminiCommandResult> ProcessVoiceCommandAsync(
        string transcript,
        string screen,
        string? contextJson,
        CancellationToken ct = default);
}

public sealed record GeminiCommandResult(
    string Action,
    JsonElement? Parameters,
    string SpokenFeedback,
    double Confidence
);
