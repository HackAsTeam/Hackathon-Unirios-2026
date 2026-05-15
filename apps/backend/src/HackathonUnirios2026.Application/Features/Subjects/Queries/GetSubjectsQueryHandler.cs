using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Subjects.Queries;

public sealed class GetSubjectsQueryHandler(AppDbContext db) : IRequestHandler<GetSubjectsQuery, List<SubjectResponse>>
{
    public async Task<List<SubjectResponse>> Handle(GetSubjectsQuery query, CancellationToken ct)
    {
        return await db.Subjects
            .OrderBy(s => s.Name)
            .Select(s => new SubjectResponse(s.Id, s.Name, s.Description, s.CreatedAt))
            .ToListAsync(ct);
    }
}
