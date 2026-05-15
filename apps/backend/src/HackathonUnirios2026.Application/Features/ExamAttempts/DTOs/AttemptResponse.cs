namespace HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;

public record AttemptResponse(
    Guid Id,
    Guid ExamId,
    string StudentId,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    string Status,
    int AnsweredCount,
    int TotalQuestions);

public record QuestionAnswerResponse(
    Guid Id,
    Guid QuestionId,
    string AnswerText,
    decimal? Score,
    string? Feedback,
    DateTime AnsweredAt);
