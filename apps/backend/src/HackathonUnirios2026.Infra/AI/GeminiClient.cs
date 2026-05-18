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
        "GO_BACK", "GO_HOME", "NAVIGATE_TO", "OPEN_RESULTS",
        "OPEN_JOIN_MODAL",
        "CREATE_CLASSROOM", "CREATE_SUBJECT",
        "GENERATE_INVITE_LINK", "NAVIGATE_TO_CLASSROOM_AND_INVITE",
        "START_ACTIVITY", "SUBMIT_ANSWER",
        "READ_ALOUD", "SELECT_ALTERNATIVE",
        "LIST_PENDING_ACTIVITIES", "LIST_CLASSROOMS", "LIST_ATTEMPTS",
        "UNKNOWN",
    ];

    public async Task<GeminiCommandResult> ProcessVoiceCommandAsync(
        string transcript,
        string screen,
        string? contextJson,
        string? userDataContext,
        CancellationToken ct = default)
    {
        var opts = options.Value;
        var client = httpClientFactory.CreateClient("gemini");

        var prompt = BuildPrompt(transcript, screen, contextJson, userDataContext);

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

    private static string BuildPrompt(string transcript, string screen, string? contextJson, string? userDataContext)
    {
        var ctx = string.IsNullOrWhiteSpace(contextJson) ? "nenhum" : contextJson;
        var userData = string.IsNullOrWhiteSpace(userDataContext) ? "Dados do usuário indisponíveis." : userDataContext;
        return $$"""
            Você é Dillo, um assistente de voz para um app educacional em português brasileiro.
            Responda SOMENTE com um objeto JSON válido, sem texto adicional, sem markdown, sem explicações.

            === CONTEXTO ===
            Tela atual: {{screen}}
            Contexto da tela: {{ctx}}
            {{userData}}

            === AÇÕES DISPONÍVEIS ===
            Use exatamente estes valores para "action":

            Navegação:
            - GO_BACK: Volta para a tela anterior
            - GO_HOME: Vai para a tela inicial (/(app)/(tabs))
            - NAVIGATE_TO: Navega para rota específica. Parâmetro: route
              Rotas válidas: /(app)/(tabs)/profile, /(app)/(tabs)/results
            - OPEN_RESULTS: Abre a tela de resultados/notas (alunos)

            Ações em telas de aluno:
            - OPEN_JOIN_MODAL: Abre modal para ingressar em turma (tela home-student)
            - START_ACTIVITY: Inicia a atividade atual (tela student-activity)
            - SUBMIT_ANSWER: Envia a resposta atual (telas respond-text, respond-audio, respond-oral)

            Ações de professor (disponíveis em qualquer tela quando o papel do usuário for professor):
            - CREATE_CLASSROOM: Cria uma nova turma. Parâmetros: title (obrigatório), description (opcional)
              Use quando professor diz "criar turma X", "crie uma turma X", "nova turma X", "criar turma de X", "criar turma chamada X"
            - CREATE_SUBJECT: Cria nova matéria na turma atual. Parâmetros: name (obrigatório), description (opcional)
              Use quando professor diz "criar matéria X" ou "nova matéria X" (apenas em tela teacher-classroom)
            - GENERATE_INVITE_LINK: Gera link de convite para alunos (apenas em tela teacher-classroom)
            - NAVIGATE_TO_CLASSROOM_AND_INVITE: Navega para uma turma específica e gera link de convite.
              Use quando professor pedir convite para uma turma pelo nome a partir de qualquer tela que não seja teacher-classroom.
              Parâmetro: classroomName (nome da turma mencionada pelo professor)
              Exemplo: "criar link de convite para turma de matemática" → {"action":"NAVIGATE_TO_CLASSROOM_AND_INVITE","parameters":{"classroomName":"matemática"},"spokenFeedback":"Indo para a turma de matemática e gerando o convite.","confidence":0.95}

            Informação/Leitura:
            - LIST_PENDING_ACTIVITIES: Lista atividades pendentes do aluno
            - LIST_CLASSROOMS: Lista turmas do usuário
            - LIST_ATTEMPTS: Lista tentativas/resultados do aluno
            - READ_ALOUD: Lê o enunciado da questão em voz alta.
              Use quando o aluno disser "leia", "repita a questão", "qual é a pergunta", "não ouvi", etc.
              Disponível apenas nas telas respond-text e respond-oral.
            - SELECT_ALTERNATIVE: Seleciona uma alternativa de múltipla escolha.
              Parâmetros: optionLetter (A, B, C ou D), questionIndex (inteiro 0-based, padrão 0)
              Use quando o aluno disser "alternativa A", "letra B", "escolho C", "marcar D", etc.
              Disponível apenas na tela respond-text.

            - UNKNOWN: Não entendeu ou não pode realizar o comando

            === REGRAS ===
            1. Se o aluno pedir atividades pendentes mas o contexto diz "não está matriculado em nenhuma turma", use UNKNOWN e diga no spokenFeedback: "Você ainda não está em nenhuma turma. Peça ao professor um link de convite para ingressar."
            2. Se o aluno pedir atividades e o contexto diz "Todas as N atividade(s) foram concluídas", use LIST_PENDING_ACTIVITIES e diga: "Parabéns! Você concluiu todas as suas atividades."
            3. Para CREATE_CLASSROOM, extraia o nome do título mesmo que diga "chamada X", "com nome X", "de X", etc. CREATE_CLASSROOM pode ser usado de qualquer tela quando o usuário for professor.
            4. Para CREATE_SUBJECT, só use se estiver na tela teacher-classroom.
            5. Para LIST_PENDING_ACTIVITIES (pedidos como "lista atividades", "quais atividades tenho", "atividades pendentes", etc.): use os dados "Por matéria" do contexto para compor o spokenFeedback matéria a matéria. Exemplo: se contexto diz "Matemática: 2 atividade(s); Português: 1 atividade(s)", responda: "Você tem 3 atividades pendentes: 2 em Matemática e 1 em Português."
            6. Ações de configuração de acessibilidade (fonte, contraste, etc.) são tratadas localmente — use UNKNOWN se o usuário pedir isso.
            7. Responda sempre em português brasileiro no spokenFeedback.
            8. Se o usuário for professor e pedir para criar uma turma (independente da tela atual), use CREATE_CLASSROOM.
            9. Se o professor pedir para gerar/criar link de convite mencionando o nome de uma turma e não estiver na tela teacher-classroom, use SEMPRE NAVIGATE_TO_CLASSROOM_AND_INVITE — nunca retorne UNKNOWN nesse caso.
            10. SELECT_ALTERNATIVE só deve ser usado na tela respond-text. Em qualquer outra tela, retorne UNKNOWN.
            11. READ_ALOUD só deve ser usado nas telas respond-text e respond-oral. Em qualquer outra tela, retorne UNKNOWN.

            === COMANDO DO USUÁRIO ===
            "{{transcript}}"

            Retorne exatamente este formato JSON:
            {"action":"<ação>","parameters":{"route":"","title":"","description":"","name":"","text":"","questionId":"","optionLetter":"","questionIndex":0,"answerText":""},"spokenFeedback":"<texto em português>","confidence":0.9}
            """;
    }

    private static GeminiCommandResult UnknownResult(string speak) =>
        new("UNKNOWN", null, speak, 0.0);
}
