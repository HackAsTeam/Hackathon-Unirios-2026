using HackathonUnirios2026.Domain.AI;

namespace HackathonUnirios2026.Infra.AI;

public sealed class FallbackAIClient(GroqClient groq, GeminiClient gemini) : IGeminiClient
{
    public async Task<GeminiCommandResult> ProcessVoiceCommandAsync(
        string transcript,
        string screen,
        string? contextJson,
        string? userDataContext,
        CancellationToken ct = default)
    {
        try
        {
            return await groq.ProcessVoiceCommandAsync(transcript, screen, contextJson, userDataContext, ct);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[FallbackAIClient] Groq falhou ({ex.Message}), tentando Gemini...");
        }

        try
        {
            return await gemini.ProcessVoiceCommandAsync(transcript, screen, contextJson, userDataContext, ct);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[FallbackAIClient] Gemini também falhou ({ex.Message})");
            return VoiceCommandResponseParser.Unknown("Não consegui processar. Tente novamente.");
        }
    }
}
