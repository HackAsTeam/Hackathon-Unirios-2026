namespace HackathonUnirios2026.Application.Features.Classrooms.DTOs;

public record ClassroomMemberResponse(
    string UserId,
    string? DisplayName,
    string? AvatarUrl,
    string Role);
