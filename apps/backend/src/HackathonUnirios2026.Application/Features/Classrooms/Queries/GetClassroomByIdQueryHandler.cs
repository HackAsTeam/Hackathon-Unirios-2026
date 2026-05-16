using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Infra.Database;
using HackathonUnirios2026.Application.Features.Classrooms;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public sealed class GetClassroomByIdQueryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GetClassroomByIdQuery, ClassroomDetailResponse>
{
    public async Task<ClassroomDetailResponse> Handle(GetClassroomByIdQuery query, CancellationToken ct)
    {
        var userId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var classroom = await db.Classrooms
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .Include(c => c.Subjects)
            .FirstOrDefaultAsync(c =>
                c.Id == query.ClassroomId &&
                (c.TeacherId == userId || c.Enrollments.Any(e => e.StudentId == userId)), ct);

        if (classroom is null)
            throw new ClassroomNotFoundException();

        return new ClassroomDetailResponse(
            classroom.Id,
            classroom.Title,
            classroom.Description,
            classroom.TeacherId,
            classroom.Teacher.DisplayName,
            classroom.CreatedAt,
            classroom.Enrollments.Count,
            classroom.Subjects
                .OrderBy(s => s.Name)
                .Select(s => new SubjectResponse(s.Id, s.ClassroomId, s.Name, s.Description, s.CreatedBy, s.CreatedAt))
                .ToList());
    }
}
