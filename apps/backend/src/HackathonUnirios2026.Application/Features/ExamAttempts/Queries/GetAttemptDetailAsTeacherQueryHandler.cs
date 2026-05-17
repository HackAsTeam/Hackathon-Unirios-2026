using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Queries;

public sealed class GetAttemptDetailAsTeacherQueryHandler(AppDbContext db)
    : IRequestHandler<GetAttemptDetailAsTeacherQuery, TeacherAttemptDetailResponse>
{
    public async Task<TeacherAttemptDetailResponse> Handle(GetAttemptDetailAsTeacherQuery query, CancellationToken ct)
    {
        var attempt = await db.ExamAttempts
            .Include(a => a.Answers)
                .ThenInclude(ans => ans.Question)
                    .ThenInclude(q => q.Options)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Classroom)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.Id == query.AttemptId, ct);

        if (attempt is null) throw new AttemptNotFoundException();

        if (attempt.Exam.Classroom.TeacherId != query.TeacherId) throw new NotTeacherException();

        decimal? score = attempt.Status == AttemptStatus.Graded
            ? attempt.Answers.Sum(a => a.Score ?? 0)
            : null;

        return new TeacherAttemptDetailResponse(
            attempt.Id,
            attempt.ExamId,
            attempt.Exam.Title,
            attempt.Exam.Classroom.Title,
            attempt.Student.DisplayName,
            attempt.StartedAt,
            attempt.SubmittedAt,
            attempt.Status.ToString(),
            score,
            attempt.Answers
                .OrderBy(a => a.Question.OrderIndex)
                .Select(a =>
                {
                    var selectedOption = a.SelectedOptionId.HasValue
                        ? a.Question.Options.FirstOrDefault(o => o.Id == a.SelectedOptionId.Value)
                        : null;
                    return new TeacherAnswerDetailResponse(
                        a.Id,
                        a.QuestionId,
                        a.Question.Text,
                        a.AnswerText,
                        a.Format,
                        a.SelectedOptionId,
                        selectedOption?.Text,
                        selectedOption?.IsCorrect,
                        a.Score,
                        a.Feedback,
                        a.AnsweredAt);
                })
                .ToList());
    }
}
