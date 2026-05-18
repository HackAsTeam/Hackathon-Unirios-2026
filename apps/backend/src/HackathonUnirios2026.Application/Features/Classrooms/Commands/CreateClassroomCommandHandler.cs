using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Classrooms.Commands;

public sealed class CreateClassroomCommandHandler(AppDbContext db)
    : IRequestHandler<CreateClassroomCommand, ClassroomResponse>
{
    public async Task<ClassroomResponse> Handle(CreateClassroomCommand cmd, CancellationToken ct)
    {
        var teacher = await db.Users.FindAsync([cmd.TeacherId], ct);

        var classroom = new Classroom
        {
            Title = cmd.Title,
            Description = cmd.Description,
            TeacherId = cmd.TeacherId,
        };

        db.Classrooms.Add(classroom);
        await db.SaveChangesAsync(ct);

        return new ClassroomResponse(
            classroom.Id,
            classroom.Title,
            classroom.Description,
            classroom.TeacherId,
            teacher?.DisplayName,
            classroom.CreatedAt,
            []);
    }
}
