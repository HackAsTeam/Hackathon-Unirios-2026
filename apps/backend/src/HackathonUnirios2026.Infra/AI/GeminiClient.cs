using System.Net.Http.Json;
using System.Text.Json;
using System.Linq;
using HackathonUnirios2026.Domain.AI;
using Microsoft.Extensions.Options;

namespace HackathonUnirios2026.Infra.AI;

public sealed class GeminiClient(IHttpClientFactory httpClientFactory, IOptions<GeminiOptions> options)
    : IGeminiClient
{
    private static readonly string[] AllowedActions =
    [
        "GO_BACK", "GO_HOME", "NAVIGATE_TO",
        "READ_ALOUD", "SELECT_ALTERNATIVE", "SUBMIT_ANSWER",
        "LIST_PENDING_ACTIVITIES", "UNKNOWN",
    ];

    private static readonly JsonElement ActionSchema = JsonDocument.Parse("""
        {
          "type": "object",
          "properties": {
            "action": {
              "type": "string",
              "enum": ["GO_BACK","GO_HOME","NAVIGATE_TO","READ_ALOUD","SELECT_ALTERNATIVE","SUBMIT_ANSWER","LIST_PENDING_ACTIVITIES","UNKNOWN"]
            },
            "parameters": {
              "type": "object",
              "properties": {
                "route": { "type": "string" },
                "text": { "type": "string" },
                "questionId": { "type": "string" },
                "optionId": { "type": "string" },
                "answerText": { "type": "string" }
              }
            },
            "spokenFeedback": { "type": "string" },
            "confidence": { "type": "number" }
          },
          "required": ["action","spokenFeedback","confidence"]
        }
        """).RootElement;

    public async Task<GeminiCommandResult> ProcessVoiceCommandAsync(
        string transcript,
        string screen,
        string? contextJson,
        CancellationToken ct = default)
    {
        var opts = options.Value;
        var client = httpClientFactory.CreateClient("gemini");

        var prompt = BuildPrompt(transcript, screen, contextJson);

        var requestBody = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new
            {
                responseMimeType = "application/json",
                maxOutputTokens = 512,
                temperature = 0.1,
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{opts.Model}:generateContent?key={opts.ApiKey}";
        using var response = await client.PostAsJsonAsync(url, requestBody, ct);

        var responseBody = await response.Content.ReadAsStringAsync(ct);
        Console.WriteLine($"[GeminiClient] HTTP {(int)response.StatusCode}, body ({responseBody.Length} chars): {responseBody[..Math.Min(500, responseBody.Length)]}");

        if (!response.IsSuccessStatusCode)
        {
            Console.Error.WriteLine($"[GeminiClient] falha HTTP {(int)response.StatusCode}");
            return UnknownResult("Não consegui processar. Tente novamente.");
        }

        JsonDocument doc;
        try
        {
            doc = JsonDocument.Parse(responseBody);
        }
        catch (JsonException ex)
        {
            Console.Error.WriteLine($"[GeminiClient] resposta não-JSON: {responseBody[..Math.Min(200, responseBody.Length)]} | {ex.Message}");
            return UnknownResult("Não consegui processar. Tente novamente.");
        }

        using (doc)
        {

        var parts = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts");

        var text = string.Concat(
            Enumerable.Range(0, parts.GetArrayLength())
                .Select(i => parts[i].TryGetProperty("text", out var t) ? t.GetString() ?? "" : "")
        );

        Console.WriteLine($"[GeminiClient] text recebido ({text.Length} chars): {text}");

        JsonDocument parsed;
        try
        {
            parsed = JsonDocument.Parse(text);
        }
        catch (JsonException)
        {
            // Gemini às vezes envolve JSON em markdown (```json ... ```) ou adiciona prefixo
            var jsonStart = text.IndexOf('{');
            var jsonEnd = text.LastIndexOf('}');
            if (jsonStart < 0 || jsonEnd < jsonStart)
                return UnknownResult("Não entendi o comando. Pode repetir?");
            try { parsed = JsonDocument.Parse(text[jsonStart..(jsonEnd + 1)]); }
            catch { return UnknownResult("Não entendi o comando. Pode repetir?"); }
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

        } // using doc
    }

    private static string BuildPrompt(string transcript, string screen, string? contextJson)
    {
        var ctx = string.IsNullOrWhiteSpace(contextJson) ? "nenhum" : contextJson;
        return $$"""
            Você é um assistente de acessibilidade de um app educacional em português brasileiro.
            Responda SOMENTE com um objeto JSON válido, sem texto adicional, sem markdown, sem explicações.

            Tela atual: {{screen}}
            Contexto: {{ctx}}

            Ações possíveis (use exatamente esses valores para "action"):
            GO_BACK, GO_HOME, NAVIGATE_TO, READ_ALOUD, SELECT_ALTERNATIVE, SUBMIT_ANSWER, LIST_PENDING_ACTIVITIES, UNKNOWN

            Comando do usuário: "{{transcript}}"

            Retorne exatamente este formato JSON (apenas o JSON, nada mais):
            {"action":"<ação>","parameters":{"route":"","text":"","questionId":"","optionId":"","answerText":""},"spokenFeedback":"<texto em português para falar ao usuário>","confidence":0.9}

            Se não entender o comando, use action "UNKNOWN" e explique no spokenFeedback.
            """;
    }

    private static GeminiCommandResult UnknownResult(string speak) =>
        new("UNKNOWN", null, speak, 0.0);
}
