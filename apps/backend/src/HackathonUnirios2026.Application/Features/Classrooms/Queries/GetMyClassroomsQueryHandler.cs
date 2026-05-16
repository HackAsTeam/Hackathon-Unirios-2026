using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public sealed class GetMyClassroomsQueryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GetMyClassroomsQuery, List<ClassroomResponse>>
{
    public async Task<List<ClassroomResponse>> Handle(GetMyClassroomsQuery query, CancellationToken ct)
    {
        var userId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        return await db.Classrooms
            .Include(c => c.Subject)
            .Include(c => c.Teacher)
            .Where(c => c.TeacherId == userId || c.Enrollments.Any(e => e.StudentId == userId))
            .Select(c => new ClassroomResponse(
                c.Id,
                c.Title,
                c.Description,
                c.SubjectId,
                c.Subject.Name,
                c.TeacherId,
                c.Teacher.DisplayName,
                c.CreatedAt))
            .ToListAsync(ct);
    }
}
