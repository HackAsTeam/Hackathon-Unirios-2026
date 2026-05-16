using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public record SubmitAttemptAnswersCommand(Guid AttemptId, List<SubmitAttemptAnswerDto> Answers) : IRequest<SubmitAnswersResponse>;

public record SubmitAttemptAnswerDto(Guid QuestionId, Guid SelectedOptionId);
