using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public sealed class RevokeInvitationLinkCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<RevokeInvitationLinkCommand>
{
    public async Task Handle(RevokeInvitationLinkCommand cmd, CancellationToken ct)
    {
        var teacherId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var link = await db.InvitationLinks
            .Include(l => l.Classroom)
            .FirstOrDefaultAsync(l => l.Id == cmd.LinkId, ct);

        if (link is null)
            throw new InvitationNotFoundException();

        if (link.Classroom.TeacherId != teacherId)
            throw new NotTeacherException();

        link.IsActive = false;
        await db.SaveChangesAsync(ct);
    }
}
