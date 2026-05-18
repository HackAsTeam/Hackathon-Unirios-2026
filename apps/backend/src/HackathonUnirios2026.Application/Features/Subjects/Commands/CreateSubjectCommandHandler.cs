using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Subjects.Commands;

public sealed class CreateSubjectCommandHandler(AppDbContext db)
    : IRequestHandler<CreateSubjectCommand, SubjectResponse>
{
    public async Task<SubjectResponse> Handle(CreateSubjectCommand cmd, CancellationToken ct)
    {
        var classroom = await db.Classrooms.FirstOrDefaultAsync(c => c.Id == cmd.ClassroomId, ct);
        if (classroom is null)
            throw new ClassroomNotFoundException();
        if (classroom.TeacherId != cmd.TeacherId)
            throw new NotTeacherException();

        var subject = new Subject
        {
            ClassroomId = cmd.ClassroomId,
            Name = cmd.Name,
            Description = cmd.Description,
        };

        db.Subjects.Add(subject);
        await db.SaveChangesAsync(ct);

        return new SubjectResponse(
            subject.Id,
            subject.ClassroomId,
            subject.Name,
            subject.Description,
            subject.CreatedBy,
            subject.CreatedAt);
    }
}
