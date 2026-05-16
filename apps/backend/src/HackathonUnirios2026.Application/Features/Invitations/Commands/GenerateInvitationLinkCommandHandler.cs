using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public sealed class GenerateInvitationLinkCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GenerateInvitationLinkCommand, InvitationLinkResponse>
{
    public async Task<InvitationLinkResponse> Handle(GenerateInvitationLinkCommand cmd, CancellationToken ct)
    {
        var teacherId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var classroom = await db.Classrooms.FirstOrDefaultAsync(c => c.Id == cmd.ClassroomId, ct);
        if (classroom is null || classroom.TeacherId != teacherId)
            throw new NotTeacherException();

        var link = new InvitationLink
        {
            Token = Guid.NewGuid().ToString("N"),
            ClassroomId = cmd.ClassroomId,
            ExpiresAt = cmd.ExpiresAt,
            MaxUses = cmd.MaxUses,
            UseCount = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        db.InvitationLinks.Add(link);
        await db.SaveChangesAsync(ct);

        return new InvitationLinkResponse(
            link.Id,
            link.Token,
            link.ClassroomId,
            link.ExpiresAt,
            link.MaxUses,
            link.UseCount,
            link.IsActive,
            link.CreatedAt);
    }
}
