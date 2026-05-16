using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Classrooms.Commands;

public sealed class CreateClassroomCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<CreateClassroomCommand, ClassroomResponse>
{
    public async Task<ClassroomResponse> Handle(CreateClassroomCommand cmd, CancellationToken ct)
    {
        var teacherId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var classroom = new Classroom
        {
            Title = cmd.Title,
            Description = cmd.Description,
            TeacherId = teacherId,
        };

        db.Classrooms.Add(classroom);
        await db.SaveChangesAsync(ct);

        var created = await db.Classrooms
            .Include(c => c.Subjects)
            .Include(c => c.Teacher)
            .FirstAsync(c => c.Id == classroom.Id, ct);

        return new ClassroomResponse(
            created.Id,
            created.Title,
            created.Description,
            created.TeacherId,
            created.Teacher.DisplayName,
            created.CreatedAt,
            []);
    }
}
