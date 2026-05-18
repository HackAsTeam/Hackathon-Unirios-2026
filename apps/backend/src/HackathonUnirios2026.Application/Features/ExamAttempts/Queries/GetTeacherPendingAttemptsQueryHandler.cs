using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Queries;

public sealed class GetTeacherPendingAttemptsQueryHandler(AppDbContext db)
    : IRequestHandler<GetTeacherPendingAttemptsQuery, List<PendingAttemptResponse>>
{
    public async Task<List<PendingAttemptResponse>> Handle(GetTeacherPendingAttemptsQuery query, CancellationToken ct)
    {
        return await db.ExamAttempts
            .AsNoTracking()
            .Where(a => a.Status == AttemptStatus.Submitted
                && a.SubmittedAt != null
                && a.Exam.Classroom.TeacherId == query.TeacherId
                && a.Exam.SubjectId != null)
            .Select(a => new PendingAttemptResponse(
                a.Id,
                a.Student.DisplayName ?? a.Student.Email!,
                a.SubmittedAt!.Value,
                a.ExamId,
                a.Exam.Title,
                a.Exam.SubjectId!.Value,
                a.Exam.Subject!.Name,
                a.Exam.ClassroomId,
                a.Exam.Classroom.Title))
            .ToListAsync(ct);
    }
}
