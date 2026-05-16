namespace HackathonUnirios2026.Application.Features.Invitations.DTOs;

public record InvitationLinkResponse(
    Guid Id,
    string Token,
    string InviteUrl,
    Guid ClassroomId,
    DateTime? ExpiresAt,
    int? MaxUses,
    int UseCount,
    bool IsActive,
    DateTime CreatedAt);

public record EnrollmentResponse(
    Guid Id,
    Guid ClassroomId,
    string ClassroomTitle,
    string StudentId,
    DateTime JoinedAt);
