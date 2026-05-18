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

        if (enrolledClassroomIds.Count == 0)
            return [];

        var examRows = await db.Exams
            .AsNoTracking()
            .Where(e => e.SubjectId != null && enrolledClassroomIds.Contains(e.ClassroomId))
            .Select(e => new
            {
                e.Id,
                e.Title,
                e.SubjectId,
                SubjectName = e.Subject!.Name,
                e.ClassroomId,
                ClassroomTitle = e.Classroom.Title,
                TotalQuestions = e.Questions.Count(),
            })
            .ToListAsync(ct);

        if (examRows.Count == 0)
            return [];

        var examIds = examRows.Select(e => e.Id).ToList();

        var attempts = await db.ExamAttempts
            .AsNoTracking()
            .Where(a => a.StudentId == query.StudentId && examIds.Contains(a.ExamId))
            .Select(a => new
            {
                a.Id,
                a.ExamId,
                a.Status,
                a.StartedAt,
                AnsweredCount = a.Answers.Count(),
            })
            .ToListAsync(ct);

        return examRows
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
                x.exam.SubjectName,
                x.exam.ClassroomId,
                x.exam.ClassroomTitle,
                x.attempt?.Status.ToString(),
                x.attempt?.Id,
                x.attempt?.AnsweredCount ?? 0,
                x.exam.TotalQuestions))
            .ToList();
    }
}
