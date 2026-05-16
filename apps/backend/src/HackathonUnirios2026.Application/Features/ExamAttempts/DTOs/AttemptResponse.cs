namespace HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;

public record AttemptResponse(
    Guid Id,
    Guid ExamId,
    string StudentId,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    string Status,
    int AnsweredCount,
    int TotalQuestions,
    decimal? Score);

public record QuestionAnswerResponse(
    Guid Id,
    Guid QuestionId,
    Guid? SelectedOptionId,
    string? AnswerText,
    decimal? Score,
    string? Feedback,
    DateTime AnsweredAt);

public record SubmitAnswersResponse(
    Guid Id,
    Guid ExamId,
    string StudentId,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    string Status,
    int AnsweredCount,
    int TotalQuestions,
    decimal Score);
