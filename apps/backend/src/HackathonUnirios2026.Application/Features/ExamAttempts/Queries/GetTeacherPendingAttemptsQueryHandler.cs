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
        var raw = await db.ExamAttempts
            .AsNoTracking()
            .Where(a => a.Status == AttemptStatus.Submitted
                && a.Exam.Classroom.TeacherId == query.TeacherId
                && a.Exam.SubjectId != null)
            .Select(a => new
            {
                AttemptId = a.Id,
                StudentName = a.Student.DisplayName ?? a.Student.Email!,
                SubmittedAt = a.SubmittedAt,
                ActivityId = a.ExamId,
                ActivityTitle = a.Exam.Title,
                SubjectId = a.Exam.SubjectId,
                SubjectName = a.Exam.Subject!.Name,
                ClassroomId = a.Exam.ClassroomId,
                ClassroomTitle = a.Exam.Classroom.Title,
            })
            .ToListAsync(ct);

        return raw.Select(r => new PendingAttemptResponse(
            r.AttemptId,
            r.StudentName,
            r.SubmittedAt!.Value,
            r.ActivityId,
            r.ActivityTitle,
            r.SubjectId!.Value,
            r.SubjectName,
            r.ClassroomId,
            r.ClassroomTitle))
        .ToList();
    }
}
