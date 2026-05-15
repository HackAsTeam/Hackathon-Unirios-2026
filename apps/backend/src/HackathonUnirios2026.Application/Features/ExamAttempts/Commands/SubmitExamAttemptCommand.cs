using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public record SubmitExamAttemptCommand(Guid AttemptId) : IRequest<AttemptResponse>;
