using System.Security.Claims;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Queries;

public sealed class GetAttemptDetailQueryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GetAttemptDetailQuery, AttemptDetailResponse?>
{
    public async Task<AttemptDetailResponse?> Handle(GetAttemptDetailQuery query, CancellationToken ct)
    {
        var studentId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var attempt = await db.ExamAttempts
            .Include(a => a.Answers)
                .ThenInclude(ans => ans.Question)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Classroom)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
            .FirstOrDefaultAsync(a => a.Id == query.AttemptId && a.StudentId == studentId, ct);

        if (attempt is null) return null;

        decimal? score = attempt.Status == AttemptStatus.Graded
            ? attempt.Answers.Sum(a => a.Score ?? 0)
            : null;

        return new AttemptDetailResponse(
            attempt.Id,
            attempt.ExamId,
            attempt.Exam.Title,
            attempt.Exam.Classroom.Title,
            attempt.StartedAt,
            attempt.SubmittedAt,
            attempt.Status.ToString(),
            score,
            attempt.Answers
                .OrderBy(a => a.Question.OrderIndex)
                .Select(a => new AnswerDetailResponse(
                    a.Id,
                    a.QuestionId,
                    a.Question.Text,
                    a.AnswerText,
                    a.Format,
                    a.SelectedOptionId,
                    a.Score,
                    a.Feedback,
                    a.AnsweredAt))
                .ToList());
    }
}
