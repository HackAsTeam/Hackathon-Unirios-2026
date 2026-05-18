using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public sealed class RevokeInvitationLinkCommandHandler(AppDbContext db)
    : IRequestHandler<RevokeInvitationLinkCommand>
{
    public async Task Handle(RevokeInvitationLinkCommand cmd, CancellationToken ct)
    {
        var link = await db.InvitationLinks
            .Include(l => l.Classroom)
            .FirstOrDefaultAsync(l => l.Id == cmd.LinkId, ct);

        if (link is null)
            throw new InvitationNotFoundException();

        if (link.Classroom.TeacherId != cmd.TeacherId)
            throw new NotTeacherException();

        link.IsActive = false;
        await db.SaveChangesAsync(ct);
    }
}
