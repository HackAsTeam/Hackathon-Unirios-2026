using System.Net.Http.Json;
using System.Text.Json;
using System.Linq;
using HackathonUnirios2026.Domain.AI;
using Microsoft.Extensions.Options;

namespace HackathonUnirios2026.Infra.AI;

public sealed class GeminiClient(IHttpClientFactory httpClientFactory, IOptions<GeminiOptions> options)
    : IGeminiClient
{
    public async Task<GeminiCommandResult> ProcessVoiceCommandAsync(
        string transcript,
        string screen,
        string? contextJson,
        string? userDataContext,
        CancellationToken ct = default)
    {
        var opts = options.Value;
        var client = httpClientFactory.CreateClient("gemini");

        var prompt = VoiceCommandPromptBuilder.Build(transcript, screen, contextJson, userDataContext);

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
            throw new HttpRequestException($"Gemini retornou HTTP {(int)response.StatusCode}");

        JsonDocument doc;
        try
        {
            doc = JsonDocument.Parse(responseBody);
        }
        catch (JsonException ex)
        {
            Console.Error.WriteLine($"[GeminiClient] resposta não-JSON: {responseBody[..Math.Min(200, responseBody.Length)]} | {ex.Message}");
            throw;
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
            return VoiceCommandResponseParser.Parse(text);
        }
    }
}
