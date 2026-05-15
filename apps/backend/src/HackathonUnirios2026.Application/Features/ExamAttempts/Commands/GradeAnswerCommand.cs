using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public record GradeAnswerCommand(Guid AttemptId, Guid AnswerId, decimal Score, string? Feedback) : IRequest<QuestionAnswerResponse>;
