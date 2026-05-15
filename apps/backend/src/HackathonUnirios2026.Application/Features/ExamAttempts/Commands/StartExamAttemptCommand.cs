using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public record StartExamAttemptCommand(Guid ExamId) : IRequest<AttemptResponse>;
