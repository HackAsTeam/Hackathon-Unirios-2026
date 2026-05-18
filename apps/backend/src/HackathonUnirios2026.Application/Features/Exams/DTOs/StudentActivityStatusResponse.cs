namespace HackathonUnirios2026.Application.Features.Exams.DTOs;

public record StudentActivityStatusResponse(
    Guid ActivityId, string ActivityTitle,
    Guid SubjectId, string SubjectName,
    Guid ClassroomId, string ClassroomTitle,
    string? AttemptStatus, Guid? AttemptId,
    int AnsweredCount, int TotalQuestions);
