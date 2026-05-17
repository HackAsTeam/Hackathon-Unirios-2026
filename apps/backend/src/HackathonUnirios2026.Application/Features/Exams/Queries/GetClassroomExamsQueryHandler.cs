using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public sealed class GetClassroomExamsQueryHandler(AppDbContext db)
    : IRequestHandler<GetClassroomExamsQuery, List<ExamResponse>>
{
    public async Task<List<ExamResponse>> Handle(GetClassroomExamsQuery query, CancellationToken ct)
    {
        return await db.Exams
            .Where(e => e.ClassroomId == query.ClassroomId)
            .OrderBy(e => e.SubjectId)
            .ThenByDescending(e => e.CreatedAt)
            .Select(e => new ExamResponse(
                e.Id,
                e.SubjectId,
                e.ClassroomId,
                e.Title,
                e.Description,
                e.Questions.Count,
                e.CreatedAt))
            .ToListAsync(ct);
    }
}
