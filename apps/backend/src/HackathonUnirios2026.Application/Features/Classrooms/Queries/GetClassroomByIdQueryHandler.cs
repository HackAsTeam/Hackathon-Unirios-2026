using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Infra.Database;
using HackathonUnirios2026.Application.Features.Classrooms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public sealed class GetClassroomByIdQueryHandler(AppDbContext db)
    : IRequestHandler<GetClassroomByIdQuery, ClassroomDetailResponse>
{
    public async Task<ClassroomDetailResponse> Handle(GetClassroomByIdQuery query, CancellationToken ct)
    {
        var result = await db.Classrooms
            .Where(c =>
                c.Id == query.ClassroomId &&
                (c.TeacherId == query.UserId || c.Enrollments.Any(e => e.StudentId == query.UserId)))
            .Select(c => new ClassroomDetailResponse(
                c.Id,
                c.Title,
                c.Description,
                c.TeacherId,
                c.Teacher.DisplayName,
                c.CreatedAt,
                c.Enrollments.Count,
                c.Subjects
                    .OrderBy(s => s.Name)
                    .Select(s => new SubjectResponse(s.Id, s.ClassroomId, s.Name, s.Description, s.CreatedBy, s.CreatedAt))
                    .ToList()))
            .FirstOrDefaultAsync(ct);

        if (result is null)
            throw new ClassroomNotFoundException();

        return result;
    }
}
