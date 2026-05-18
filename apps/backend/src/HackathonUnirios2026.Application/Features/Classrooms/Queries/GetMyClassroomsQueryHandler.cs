using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public sealed class GetMyClassroomsQueryHandler(AppDbContext db)
    : IRequestHandler<GetMyClassroomsQuery, List<ClassroomResponse>>
{
    public async Task<List<ClassroomResponse>> Handle(GetMyClassroomsQuery query, CancellationToken ct)
    {
        return await db.Classrooms
            .Where(c => c.TeacherId == query.UserId || c.Enrollments.Any(e => e.StudentId == query.UserId))
            .Select(c => new ClassroomResponse(
                c.Id,
                c.Title,
                c.Description,
                c.TeacherId,
                c.Teacher.DisplayName,
                c.CreatedAt,
                c.Subjects
                    .OrderBy(s => s.Name)
                    .Select(s => new SubjectResponse(s.Id, s.ClassroomId, s.Name, s.Description, s.CreatedBy, s.CreatedAt))
                    .ToList()))
            .ToListAsync(ct);
    }
}
