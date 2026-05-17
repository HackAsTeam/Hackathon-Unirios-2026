namespace HackathonUnirios2026.Application.Features.Auth.DTOs;

public record AuthResponse(string UserId, string Email, string? DisplayName, string? AvatarUrl, string Token, string Role);
