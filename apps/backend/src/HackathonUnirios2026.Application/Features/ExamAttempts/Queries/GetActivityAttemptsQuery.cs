using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Queries;

public record GetActivityAttemptsQuery(Guid ActivityId, string TeacherId) : IRequest<List<ActivityAttemptSummaryResponse>>;
