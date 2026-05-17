using System.Security.Claims;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public sealed class StartExamAttemptCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<StartExamAttemptCommand, AttemptResponse>
{
    public async Task<AttemptResponse> Handle(StartExamAttemptCommand cmd, CancellationToken ct)
    {
        var studentId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var exam = await db.Exams
            .Include(e => e.Questions)
            .Include(e => e.ClassroomExams)
            .Include(e => e.Classroom)
            .FirstOrDefaultAsync(e => e.Id == cmd.ExamId, ct);

        if (exam is null)
            throw new NotEnrolledException();

        var classroomIds = exam.ClassroomExams.Select(ce => ce.ClassroomId).Append(exam.ClassroomId).Distinct().ToList();

        var isEnrolled = await db.Enrollments
            .AnyAsync(e => classroomIds.Contains(e.ClassroomId) && e.StudentId == studentId, ct);

        if (!isEnrolled)
            throw new NotEnrolledException();

        var existing = await db.ExamAttempts
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.ExamId == cmd.ExamId && a.StudentId == studentId && a.Status == AttemptStatus.InProgress, ct);

        if (existing is not null)
        {
            return new AttemptResponse(
                existing.Id,
                existing.ExamId,
                exam.Title,
                exam.Classroom.Title,
                existing.StudentId,
                existing.StartedAt,
                existing.SubmittedAt,
                existing.Status.ToString(),
                existing.Answers.Count,
                exam.Questions.Count,
                existing.Answers.Sum(a => a.Score ?? 0));
        }

        var attempt = new ExamAttempt
        {
            ExamId = cmd.ExamId,
            StudentId = studentId,
            StartedAt = DateTime.UtcNow,
            Status = AttemptStatus.InProgress,
        };

        db.ExamAttempts.Add(attempt);
        await db.SaveChangesAsync(ct);

        return new AttemptResponse(
            attempt.Id,
            attempt.ExamId,
            exam.Title,
            exam.Classroom.Title,
            attempt.StudentId,
            attempt.StartedAt,
            attempt.SubmittedAt,
            attempt.Status.ToString(),
            0,
            exam.Questions.Count,
            0);
    }
}
