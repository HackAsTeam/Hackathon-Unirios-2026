using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Subjects.Commands;

public sealed class CreateSubjectCommandHandler(AppDbContext db) : IRequestHandler<CreateSubjectCommand, SubjectResponse>
{
    public async Task<SubjectResponse> Handle(CreateSubjectCommand cmd, CancellationToken ct)
    {
        var subject = new Subject
        {
            Name = cmd.Name,
            Description = cmd.Description,
            CreatedAt = DateTime.UtcNow,
        };

        db.Subjects.Add(subject);
        await db.SaveChangesAsync(ct);

        return new SubjectResponse(subject.Id, subject.Name, subject.Description, subject.CreatedAt);
    }
}
