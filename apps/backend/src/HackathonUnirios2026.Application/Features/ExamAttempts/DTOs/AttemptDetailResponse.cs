using HackathonUnirios2026.Domain.Enums;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;

public record AttemptDetailResponse(
    Guid Id,
    Guid ExamId,
    string ExamTitle,
    string ClassroomName,
    string StudentId,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    string Status,
    decimal? Score,
    List<AnswerDetailResponse> Answers);

public record AnswerDetailResponse(
    Guid Id,
    Guid QuestionId,
    string QuestionText,
    string? AnswerText,
    ResponseFormat? Format,
    Guid? SelectedOptionId,
    decimal? Score,
    string? Feedback,
    DateTime AnsweredAt);
