using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Invitations;
using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public sealed class JoinClassroomByTokenCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<JoinClassroomByTokenCommand, EnrollmentResponse>
{
    public async Task<EnrollmentResponse> Handle(JoinClassroomByTokenCommand cmd, CancellationToken ct)
    {
        var studentId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var link = await db.InvitationLinks
            .Include(l => l.Classroom)
            .FirstOrDefaultAsync(l => l.Token == cmd.Token && l.IsActive, ct);

        if (link is null)
            throw new InvitationNotFoundException();

        if (link.ExpiresAt.HasValue && DateTime.UtcNow > link.ExpiresAt.Value)
            throw new InvitationExpiredException();

        var alreadyEnrolled = await db.Enrollments
            .AnyAsync(e => e.ClassroomId == link.ClassroomId && e.StudentId == studentId, ct);

        if (alreadyEnrolled)
            throw new AlreadyEnrolledException();

        var enrollment = new Enrollment
        {
            ClassroomId = link.ClassroomId,
            StudentId = studentId,
            JoinedAt = DateTime.UtcNow,
        };

        db.Enrollments.Add(enrollment);

        link.UseCount++;
        if (link.MaxUses.HasValue && link.UseCount >= link.MaxUses.Value)
            link.IsActive = false;

        await db.SaveChangesAsync(ct);

        return new EnrollmentResponse(
            enrollment.Id,
            enrollment.ClassroomId,
            link.Classroom.Title,
            enrollment.StudentId,
            enrollment.JoinedAt);
    }
}
