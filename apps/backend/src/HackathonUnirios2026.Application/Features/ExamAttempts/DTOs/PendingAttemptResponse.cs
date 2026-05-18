namespace HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;

public record PendingAttemptResponse(
    Guid AttemptId, string StudentName, DateTime SubmittedAt,
    Guid ActivityId, string ActivityTitle,
    Guid SubjectId, string SubjectName,
    Guid ClassroomId, string ClassroomTitle);
