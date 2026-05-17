using HackathonUnirios2026.Domain.Enums;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;

public record TeacherAnswerDetailResponse(
    Guid Id,
    Guid QuestionId,
    string QuestionText,
    string? AnswerText,
    ResponseFormat? Format,
    Guid? SelectedOptionId,
    string? SelectedOptionText,
    bool? IsCorrectOption,
    decimal? Score,
    string? Feedback,
    DateTime AnsweredAt);
