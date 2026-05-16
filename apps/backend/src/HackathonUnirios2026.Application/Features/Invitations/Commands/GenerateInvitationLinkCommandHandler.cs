using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public sealed class GenerateInvitationLinkCommandHandler(
    AppDbContext db,
    IHttpContextAccessor httpContextAccessor,
    IConfiguration configuration)
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

        var baseUrl = configuration["App:BaseUrl"] ?? "http://localhost:5099";
        var inviteUrl = $"{baseUrl}/i/{link.Token}";

        return new InvitationLinkResponse(
            link.Id,
            link.Token,
            inviteUrl,
            link.ClassroomId,
            link.ExpiresAt,
            link.MaxUses,
            link.UseCount,
            link.IsActive,
            link.CreatedAt);
    }
}
