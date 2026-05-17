using System.Net.Http.Json;
using System.Text.Json;
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
          "type": "OBJECT",
          "properties": {
            "action": {
              "type": "STRING",
              "enum": ["GO_BACK","GO_HOME","NAVIGATE_TO","READ_ALOUD","SELECT_ALTERNATIVE","SUBMIT_ANSWER","LIST_PENDING_ACTIVITIES","UNKNOWN"]
            },
            "parameters": { "type": "OBJECT" },
            "spokenFeedback": { "type": "STRING" },
            "confidence": { "type": "NUMBER" }
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
                responseSchema = ActionSchema,
                maxOutputTokens = 256,
                temperature = 0.1,
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{opts.Model}:generateContent?key={opts.ApiKey}";
        using var response = await client.PostAsJsonAsync(url, requestBody, ct);

        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            Console.Error.WriteLine($"[GeminiClient] HTTP {(int)response.StatusCode}: {responseBody[..Math.Min(200, responseBody.Length)]}");
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

        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "{}";

        using var parsed = JsonDocument.Parse(text);
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
            O usuário pode dar comandos de voz para navegar e interagir com o app.

            Tela atual: {{screen}}
            Contexto da tela: {{ctx}}

            Ações disponíveis:
            - GO_BACK: voltar para a tela anterior
            - GO_HOME: ir para a tela inicial
            - NAVIGATE_TO { "route": "..." }: navegar para uma rota específica
            - READ_ALOUD { "text": "..." }: ler um texto em voz alta
            - SELECT_ALTERNATIVE { "questionId": "...", "optionId": "..." }: marcar alternativa em questão de múltipla escolha
            - SUBMIT_ANSWER { "questionId": "...", "answerText": "..." }: enviar resposta de questão
            - LIST_PENDING_ACTIVITIES: listar atividades pendentes
            - UNKNOWN: quando não entender o comando

            Comando do usuário: "{{transcript}}"

            Retorne JSON com a ação correspondente, parâmetros necessários, feedback em português para falar ao usuário, e sua confiança (0.0 a 1.0).
            Se a ação não for possível na tela atual ou não entender, use UNKNOWN com explicação amigável no spokenFeedback.
            """;
    }

    private static GeminiCommandResult UnknownResult(string speak) =>
        new("UNKNOWN", null, speak, 0.0);
}
