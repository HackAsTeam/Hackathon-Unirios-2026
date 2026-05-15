namespace HackathonUnirios2026.Application.Features.Exams.DTOs;

public record ExamResponse(Guid Id, Guid ClassroomId, string Title, string? Description, int QuestionCount, DateTime CreatedAt);
public record ExamDetailResponse(Guid Id, Guid ClassroomId, string Title, string? Description, List<QuestionResponse> Questions, DateTime CreatedAt);
public record QuestionResponse(Guid Id, int OrderIndex, string Text);
public record ClassroomExamResponse(Guid Id, Guid ClassroomId, Guid ExamId, DateTime AssignedAt, DateTime? DueAt);
public record CreateQuestionDto(int OrderIndex, string Text, string? ExpectedAnswer);
