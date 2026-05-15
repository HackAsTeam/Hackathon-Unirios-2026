using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Domain.Enums;
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

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        var isTeacher = user?.Role == UserRole.Teacher;

        var queryable = db.Classrooms
            .Include(c => c.Subject)
            .Include(c => c.Teacher)
            .AsQueryable();

        queryable = isTeacher
            ? queryable.Where(c => c.TeacherId == userId)
            : queryable.Where(c => c.Enrollments.Any(e => e.StudentId == userId));

        return await queryable
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
