using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using HackathonUnirios2026.Domain.AI;
using Microsoft.Extensions.Options;

namespace HackathonUnirios2026.Infra.AI;

public sealed class GroqClient(IHttpClientFactory httpClientFactory, IOptions<GroqOptions> options)
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
        var client = httpClientFactory.CreateClient("groq");

        var prompt = VoiceCommandPromptBuilder.Build(transcript, screen, contextJson, userDataContext);

        var requestBody = new
        {
            model = opts.Model,
            messages = new[] { new { role = "user", content = prompt } },
            response_format = new { type = "json_object" },
            max_tokens = 512,
            temperature = 0.1,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", opts.ApiKey);
        request.Content = JsonContent.Create(requestBody);

        using var response = await client.SendAsync(request, ct);

        var responseBody = await response.Content.ReadAsStringAsync(ct);
        Console.WriteLine($"[GroqClient] HTTP {(int)response.StatusCode}, body ({responseBody.Length} chars): {responseBody[..Math.Min(500, responseBody.Length)]}");

        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException($"Groq retornou HTTP {(int)response.StatusCode}");

        JsonDocument doc;
        try
        {
            doc = JsonDocument.Parse(responseBody);
        }
        catch (JsonException ex)
        {
            Console.Error.WriteLine($"[GroqClient] resposta não-JSON: {responseBody[..Math.Min(200, responseBody.Length)]} | {ex.Message}");
            throw;
        }

        using (doc)
        {
            var text = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";

            Console.WriteLine($"[GroqClient] text recebido ({text.Length} chars): {text}");
            return VoiceCommandResponseParser.Parse(text);
        }
    }
}
