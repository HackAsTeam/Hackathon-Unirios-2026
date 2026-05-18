using System.Text.Json;
using HackathonUnirios2026.Application.Features.VoiceCommands.DTOs;
using HackathonUnirios2026.Domain.AI;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.VoiceCommands.Commands;

public sealed class ProcessVoiceCommandCommandHandler(IGeminiClient geminiClient, AppDbContext db)
    : IRequestHandler<ProcessVoiceCommandCommand, VoiceCommandResponse>
{
    public async Task<VoiceCommandResponse> Handle(ProcessVoiceCommandCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;

        if (string.IsNullOrWhiteSpace(req.Transcript))
            return new VoiceCommandResponse("UNKNOWN", null, null, "Não ouvi nada. Pode repetir?");

        var contextJson = req.Context.HasValue
            ? req.Context.Value.ValueKind != JsonValueKind.Null ? req.Context.Value.GetRawText() : null
            : null;

        var userContext = await BuildUserContextAsync(cmd.UserId, req.Screen, req.Context, ct);

        var result = await geminiClient.ProcessVoiceCommandAsync(
            req.Transcript,
            req.Screen,
            contextJson,
            userContext,
            ct);

        if (result.Action == "NAVIGATE_TO_CLASSROOM_AND_INVITE")
            return await ResolveNavigateAndInviteAsync(cmd.UserId, result, ct);

        var type = result.Action == "UNKNOWN" ? "UNKNOWN" : "COMMAND";

        return new VoiceCommandResponse(type, result.Action, result.Parameters, result.SpokenFeedback);
    }

    private async Task<VoiceCommandResponse> ResolveNavigateAndInviteAsync(
        string userId,
        GeminiCommandResult result,
        CancellationToken ct)
    {
        var classroomName = result.Parameters.HasValue &&
            result.Parameters.Value.TryGetProperty("classroomName", out var cn)
                ? cn.GetString()
                : null;

        if (string.IsNullOrWhiteSpace(classroomName))
            return new VoiceCommandResponse("UNKNOWN", null, null, "Não consegui identificar o nome da turma. Pode repetir?");

        var nameLower = classroomName.ToLower();
        var classroom = await db.Classrooms
            .AsNoTracking()
            .Where(c => c.TeacherId == userId && c.Title.ToLower().Contains(nameLower))
            .FirstOrDefaultAsync(ct);

        if (classroom is null)
            return new VoiceCommandResponse("UNKNOWN", null, null, $"Não encontrei uma turma chamada \"{classroomName}\". Verifique o nome e tente novamente.");

        var payload = System.Text.Json.JsonSerializer.SerializeToElement(new { classroomId = classroom.Id.ToString() });
        return new VoiceCommandResponse("COMMAND", "NAVIGATE_TO_CLASSROOM_AND_INVITE", payload, result.SpokenFeedback);
    }

    private async Task<string> BuildUserContextAsync(
        string userId,
        string screen,
        JsonElement? contextElement,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return "Usuário não identificado.";

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        var role = user?.Role == UserRole.Teacher ? "professor" : "aluno";

        var lines = new List<string> { $"Papel do usuário: {role}." };

        if (user?.Role == UserRole.Student)
        {
            var classrooms = await db.Classrooms
                .AsNoTracking()
                .Where(c => c.Enrollments.Any(e => e.StudentId == userId))
                .Select(c => c.Title)
                .ToListAsync(ct);

            if (classrooms.Count == 0)
            {
                lines.Add("O aluno não está matriculado em nenhuma turma.");
            }
            else
            {
                lines.Add($"O aluno está matriculado em {classrooms.Count} turma(s): {string.Join(", ", classrooms)}.");

                var activityData = await db.Exams
                    .AsNoTracking()
                    .Where(e => e.SubjectId != null &&
                                e.Classroom.Enrollments.Any(en => en.StudentId == userId))
                    .Select(e => new
                    {
                        SubjectName = e.Subject!.Name,
                        IsDone = db.ExamAttempts.Any(a =>
                            a.ExamId == e.Id && a.StudentId == userId &&
                            (a.Status == AttemptStatus.Submitted || a.Status == AttemptStatus.Graded))
                    })
                    .ToListAsync(ct);

                var pendingActivities = activityData.Where(a => !a.IsDone).ToList();

                if (activityData.Count == 0)
                {
                    lines.Add("Nenhuma atividade disponível nas matérias.");
                }
                else if (pendingActivities.Count == 0)
                {
                    lines.Add($"Todas as {activityData.Count} atividade(s) foram concluídas. Nenhuma atividade pendente.");
                }
                else
                {
                    var bySubject = pendingActivities
                        .GroupBy(a => a.SubjectName)
                        .Select(g => $"{g.Key}: {g.Count()} atividade(s)")
                        .ToList();
                    lines.Add($"Atividades pendentes: {pendingActivities.Count} de {activityData.Count} no total. Por matéria — {string.Join("; ", bySubject)}.");
                }
            }

            // Subject-level context
            if (screen == "student-subject" && contextElement.HasValue)
            {
                var subjectId = TryGetString(contextElement.Value, "subjectId");
                if (subjectId != null)
                {
                    var activityCount = await db.Exams
                        .AsNoTracking()
                        .Where(e => e.SubjectId == Guid.Parse(subjectId))
                        .CountAsync(ct);
                    lines.Add($"A matéria atual tem {activityCount} atividade(s).");
                }
            }
        }
        else if (user?.Role == UserRole.Teacher)
        {
            var classroomCount = await db.Classrooms
                .AsNoTracking()
                .Where(c => c.TeacherId == userId)
                .CountAsync(ct);
            lines.Add($"O professor tem {classroomCount} turma(s) criada(s).");

            if (screen == "teacher-classroom" && contextElement.HasValue)
            {
                var classroomId = TryGetString(contextElement.Value, "classroomId");
                if (classroomId != null && Guid.TryParse(classroomId, out var cid))
                {
                    var classroom = await db.Classrooms
                        .AsNoTracking()
                        .Include(c => c.Enrollments)
                        .Include(c => c.Subjects)
                        .FirstOrDefaultAsync(c => c.Id == cid, ct);
                    if (classroom != null)
                    {
                        lines.Add($"Turma atual: \"{classroom.Title}\". Alunos: {classroom.Enrollments.Count}. Matérias: {classroom.Subjects.Count}.");
                    }
                }
            }
        }

        return string.Join(" ", lines);
    }

    private static string? TryGetString(JsonElement element, string property)
    {
        if (element.ValueKind == JsonValueKind.Object &&
            element.TryGetProperty(property, out var prop) &&
            prop.ValueKind == JsonValueKind.String)
        {
            return prop.GetString();
        }
        return null;
    }
}
