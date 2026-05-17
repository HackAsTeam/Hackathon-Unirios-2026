using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Queries;

public sealed class GetActivityAttemptsQueryHandler(AppDbContext db)
    : IRequestHandler<GetActivityAttemptsQuery, List<ActivityAttemptSummaryResponse>>
{
    public async Task<List<ActivityAttemptSummaryResponse>> Handle(GetActivityAttemptsQuery query, CancellationToken ct)
    {
        var exam = await db.Exams
            .Include(e => e.Classroom)
            .FirstOrDefaultAsync(e => e.Id == query.ActivityId, ct);

        if (exam is null || exam.Classroom.TeacherId != query.TeacherId)
            throw new NotTeacherException();

        return await db.ExamAttempts
            .Include(a => a.Student)
            .Where(a => a.ExamId == query.ActivityId
                && (a.Status == AttemptStatus.Submitted || a.Status == AttemptStatus.Graded))
            .Select(a => new ActivityAttemptSummaryResponse(
                a.Id,
                a.StudentId,
                a.Student.DisplayName,
                a.Student.AvatarUrl,
                a.Status.ToString(),
                a.StartedAt,
                a.SubmittedAt))
            .ToListAsync(ct);
    }
}
