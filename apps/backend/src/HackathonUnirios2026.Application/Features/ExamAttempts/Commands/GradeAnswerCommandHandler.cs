using System.Security.Claims;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public sealed class GradeAnswerCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GradeAnswerCommand, QuestionAnswerResponse>
{
    public async Task<QuestionAnswerResponse> Handle(GradeAnswerCommand cmd, CancellationToken ct)
    {
        var teacherId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var attempt = await db.ExamAttempts
            .Include(a => a.Exam)
                .ThenInclude(e => e.Classroom)
            .FirstOrDefaultAsync(a => a.Id == cmd.AttemptId, ct);

        if (attempt is null)
            throw new AttemptNotFoundException();

        if (attempt.Exam.Classroom.TeacherId != teacherId)
            throw new NotTeacherException();

        var answer = await db.QuestionAnswers
            .FirstOrDefaultAsync(qa => qa.Id == cmd.AnswerId && qa.AttemptId == cmd.AttemptId, ct);

        if (answer is null)
            throw new AttemptNotFoundException();

        if (cmd.Score.HasValue)
            answer.Score = cmd.Score.Value;
        answer.Feedback = cmd.Feedback;

        await db.SaveChangesAsync(ct);

        var allAnswers = await db.QuestionAnswers
            .Where(qa => qa.AttemptId == cmd.AttemptId)
            .ToListAsync(ct);

        var questionCount = await db.Questions.CountAsync(q => q.ExamId == attempt.ExamId, ct);

        if (allAnswers.Count == questionCount && allAnswers.All(qa => qa.Score.HasValue))
        {
            attempt.Status = AttemptStatus.Graded;
            await db.SaveChangesAsync(ct);
        }

        return new QuestionAnswerResponse(
            answer.Id,
            answer.QuestionId,
            answer.SelectedOptionId,
            answer.AnswerText,
            answer.Format,
            answer.Score,
            answer.Feedback,
            answer.AnsweredAt);
    }
}
