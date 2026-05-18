using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Subjects.Queries;

public sealed class GetSubjectsQueryHandler(AppDbContext db)
    : IRequestHandler<GetSubjectsQuery, List<SubjectResponse>>
{
    public async Task<List<SubjectResponse>> Handle(GetSubjectsQuery query, CancellationToken ct)
    {
        var hasAccess = await db.Classrooms.AnyAsync(c =>
            c.Id == query.ClassroomId &&
            (c.TeacherId == query.UserId || c.Enrollments.Any(e => e.StudentId == query.UserId)), ct);

        if (!hasAccess)
            throw new ClassroomNotFoundException();

        return await db.Subjects
            .Where(s => s.ClassroomId == query.ClassroomId)
            .OrderBy(s => s.Name)
            .Select(s => new SubjectResponse(s.Id, s.ClassroomId, s.Name, s.Description, s.CreatedBy, s.CreatedAt))
            .ToListAsync(ct);
    }
}
