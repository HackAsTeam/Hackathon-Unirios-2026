using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Subjects;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public sealed class GetSubjectExamsQueryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GetSubjectExamsQuery, List<ExamResponse>>
{
    public async Task<List<ExamResponse>> Handle(GetSubjectExamsQuery query, CancellationToken ct)
    {
        var userId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var subject = await db.Subjects
            .Include(s => s.Classroom)
                .ThenInclude(c => c.Enrollments)
            .FirstOrDefaultAsync(s => s.Id == query.SubjectId, ct);

        if (subject is null)
            throw new SubjectNotFoundException();

        if (subject.Classroom.TeacherId != userId && !subject.Classroom.Enrollments.Any(e => e.StudentId == userId))
            throw new ClassroomNotFoundException();

        return await db.Exams
            .Where(e => e.SubjectId == query.SubjectId)
            .OrderByDescending(e => e.CreatedAt)
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
