using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public sealed class GetStudentActivityStatusesQueryHandler(AppDbContext db)
    : IRequestHandler<GetStudentActivityStatusesQuery, List<StudentActivityStatusResponse>>
{
    public async Task<List<StudentActivityStatusResponse>> Handle(GetStudentActivityStatusesQuery query, CancellationToken ct)
    {
        var enrolledClassroomIds = await db.Enrollments
            .AsNoTracking()
            .Where(e => e.StudentId == query.StudentId)
            .Select(e => e.ClassroomId)
            .ToListAsync(ct);

        var exams = await db.Exams
            .AsNoTracking()
            .Include(e => e.Subject)
            .Include(e => e.Classroom)
            .Include(e => e.Questions)
            .Where(e => enrolledClassroomIds.Contains(e.ClassroomId) && e.SubjectId != null)
            .ToListAsync(ct);

        var examIds = exams.Select(e => e.Id).ToList();

        var attempts = await db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Answers)
            .Where(a => a.StudentId == query.StudentId && examIds.Contains(a.ExamId))
            .ToListAsync(ct);

        return exams
            .Select(e =>
            {
                var attempt = attempts
                    .Where(a => a.ExamId == e.Id)
                    .OrderByDescending(a => a.StartedAt)
                    .FirstOrDefault();
                return (exam: e, attempt);
            })
            .Where(x => x.attempt == null || x.attempt.Status == AttemptStatus.InProgress)
            .Select(x => new StudentActivityStatusResponse(
                x.exam.Id,
                x.exam.Title,
                x.exam.SubjectId!.Value,
                x.exam.Subject!.Name,
                x.exam.ClassroomId,
                x.exam.Classroom.Title,
                x.attempt?.Status.ToString(),
                x.attempt?.Id,
                x.attempt?.Answers.Count ?? 0,
                x.exam.Questions.Count))
            .ToList();
    }
}
