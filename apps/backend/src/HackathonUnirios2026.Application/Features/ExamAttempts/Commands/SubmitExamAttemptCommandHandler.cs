using System.Security.Claims;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public sealed class SubmitExamAttemptCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<SubmitExamAttemptCommand, AttemptResponse>
{
    public async Task<AttemptResponse> Handle(SubmitExamAttemptCommand cmd, CancellationToken ct)
    {
        var studentId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var attempt = await db.ExamAttempts
            .Include(a => a.Answers)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
            .FirstOrDefaultAsync(a => a.Id == cmd.AttemptId && a.StudentId == studentId, ct);

        if (attempt is null)
            throw new AttemptNotFoundException();

        if (attempt.Status != AttemptStatus.InProgress)
            throw new AttemptNotInProgressException();

        attempt.Status = AttemptStatus.Submitted;
        attempt.SubmittedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return new AttemptResponse(
            attempt.Id,
            attempt.ExamId,
            attempt.StudentId,
            attempt.StartedAt,
            attempt.SubmittedAt,
            attempt.Status.ToString(),
            attempt.Answers.Count,
            attempt.Exam.Questions.Count);
    }
}
