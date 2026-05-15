using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public record SaveAnswerCommand(Guid AttemptId, Guid QuestionId, string AnswerText) : IRequest<QuestionAnswerResponse>;
