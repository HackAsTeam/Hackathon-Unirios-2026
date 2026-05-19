using System.Text.Json;
using HackathonUnirios2026.Domain.AI;

namespace HackathonUnirios2026.Infra.AI;

internal static class VoiceCommandResponseParser
{
    private static readonly string[] AllowedActions =
    [
        "GO_BACK", "GO_HOME", "NAVIGATE_TO", "OPEN_RESULTS",
        "OPEN_JOIN_MODAL",
        "CREATE_CLASSROOM", "CREATE_SUBJECT",
        "GENERATE_INVITE_LINK", "NAVIGATE_TO_CLASSROOM_AND_INVITE",
        "START_ACTIVITY", "SUBMIT_ANSWER",
        "READ_ALOUD", "SELECT_ALTERNATIVE",
        "LIST_PENDING_ACTIVITIES", "LIST_CLASSROOMS", "LIST_ATTEMPTS",
        "UNKNOWN",
    ];

    internal static GeminiCommandResult Parse(string text)
    {
        JsonDocument parsed;
        try
        {
            parsed = JsonDocument.Parse(text);
        }
        catch (JsonException)
        {
            var jsonStart = text.IndexOf('{');
            var jsonEnd = text.LastIndexOf('}');
            if (jsonStart < 0 || jsonEnd < jsonStart)
                return Unknown("Não entendi o comando. Pode repetir?");
            try { parsed = JsonDocument.Parse(text[jsonStart..(jsonEnd + 1)]); }
            catch { return Unknown("Não entendi o comando. Pode repetir?"); }
        }

        using var _ = parsed;
        var root = parsed.RootElement;

        var action = root.TryGetProperty("action", out var a) ? a.GetString() ?? "UNKNOWN" : "UNKNOWN";
        if (!Array.Exists(AllowedActions, x => x == action))
            action = "UNKNOWN";

        JsonElement? parameters = root.TryGetProperty("parameters", out var p) ? p.Clone() : null;
        var spokenFeedback = root.TryGetProperty("spokenFeedback", out var sf) ? sf.GetString() ?? "Ok." : "Ok.";
        var confidence = root.TryGetProperty("confidence", out var c) ? c.GetDouble() : 0.5;

        return new GeminiCommandResult(action, parameters, spokenFeedback, confidence);
    }

    internal static GeminiCommandResult Unknown(string speak) =>
        new("UNKNOWN", null, speak, 0.0);
}
