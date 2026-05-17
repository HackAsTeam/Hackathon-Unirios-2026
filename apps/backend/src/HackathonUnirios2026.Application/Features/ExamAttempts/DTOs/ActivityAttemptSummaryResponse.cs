namespace HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;

public record ActivityAttemptSummaryResponse(
    Guid Id,
    string StudentId,
    string? StudentName,
    string? AvatarUrl,
    string Status,
    DateTime StartedAt,
    DateTime? SubmittedAt);
