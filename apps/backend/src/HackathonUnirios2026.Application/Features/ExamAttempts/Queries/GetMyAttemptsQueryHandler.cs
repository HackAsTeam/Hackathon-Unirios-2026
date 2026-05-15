using System.Security.Claims;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Queries;

public sealed class GetMyAttemptsQueryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GetMyAttemptsQuery, List<AttemptResponse>>
{
    public async Task<List<AttemptResponse>> Handle(GetMyAttemptsQuery query, CancellationToken ct)
    {
        var studentId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var queryable = db.ExamAttempts
            .Include(a => a.Answers)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
            .Where(a => a.StudentId == studentId)
            .AsQueryable();

        if (query.ExamId is { } examId)
            queryable = queryable.Where(a => a.ExamId == examId);

        return await queryable
            .Select(a => new AttemptResponse(
                a.Id,
                a.ExamId,
                a.StudentId,
                a.StartedAt,
                a.SubmittedAt,
                a.Status.ToString(),
                a.Answers.Count,
                a.Exam.Questions.Count))
            .ToListAsync(ct);
    }
}
