using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
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
        var classroom = await db.Classrooms
            .Include(c => c.Subject)
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == query.ClassroomId, ct);

        if (classroom is null)
            throw new ClassroomNotFoundException();

        return new ClassroomDetailResponse(
            classroom.Id,
            classroom.Title,
            classroom.Description,
            classroom.SubjectId,
            classroom.Subject.Name,
            classroom.TeacherId,
            classroom.Teacher.DisplayName,
            classroom.CreatedAt,
            classroom.Enrollments.Count);
    }
}
