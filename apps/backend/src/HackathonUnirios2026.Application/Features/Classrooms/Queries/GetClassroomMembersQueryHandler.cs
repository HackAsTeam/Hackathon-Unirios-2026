using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public sealed class GetClassroomMembersQueryHandler(AppDbContext db)
    : IRequestHandler<GetClassroomMembersQuery, List<ClassroomMemberResponse>>
{
    public async Task<List<ClassroomMemberResponse>> Handle(GetClassroomMembersQuery query, CancellationToken ct)
    {
        var classroom = await db.Classrooms
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments).ThenInclude(e => e.Student)
            .Where(c => c.Id == query.ClassroomId &&
                       (c.TeacherId == query.RequestingUserId ||
                        c.Enrollments.Any(e => e.StudentId == query.RequestingUserId)))
            .SingleOrDefaultAsync(ct)
            ?? throw new ClassroomNotFoundException();

        var members = new List<ClassroomMemberResponse>
        {
            new(classroom.Teacher.Id, classroom.Teacher.DisplayName, classroom.Teacher.AvatarUrl, "teacher")
        };

        members.AddRange(classroom.Enrollments.Select(e =>
            new ClassroomMemberResponse(e.Student.Id, e.Student.DisplayName, e.Student.AvatarUrl, "student")));

        return members;
    }
}
