using System.Security.Cryptography;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public sealed class GenerateInvitationLinkCommandHandler(
    AppDbContext db,
    IConfiguration configuration)
    : IRequestHandler<GenerateInvitationLinkCommand, InvitationLinkResponse>
{
    public async Task<InvitationLinkResponse> Handle(GenerateInvitationLinkCommand cmd, CancellationToken ct)
    {
        var classroom = await db.Classrooms.FirstOrDefaultAsync(c => c.Id == cmd.ClassroomId, ct);
        if (classroom is null)
            throw new ClassroomNotFoundException();
        if (classroom.TeacherId != cmd.TeacherId)
            throw new NotTeacherException();

        // 256-bit URL-safe base64 token (43 chars, no padding).
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        var link = new InvitationLink
        {
            Token = token,
            ClassroomId = cmd.ClassroomId,
            ExpiresAt = cmd.ExpiresAt,
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
            link.UseCount,
            link.IsActive,
            link.CreatedAt);
    }
}
