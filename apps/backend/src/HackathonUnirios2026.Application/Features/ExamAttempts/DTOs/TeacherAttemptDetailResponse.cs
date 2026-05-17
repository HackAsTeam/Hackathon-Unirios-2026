namespace HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;

public record TeacherAttemptDetailResponse(
    Guid Id,
    Guid ExamId,
    string ExamTitle,
    string ClassroomName,
    string? StudentName,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    string Status,
    decimal? Score,
    List<TeacherAnswerDetailResponse> Answers);
