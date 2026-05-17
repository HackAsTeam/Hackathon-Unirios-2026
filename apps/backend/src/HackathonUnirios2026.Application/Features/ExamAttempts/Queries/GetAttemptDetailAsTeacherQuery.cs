using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Queries;

public record GetAttemptDetailAsTeacherQuery(Guid AttemptId, string TeacherId) : IRequest<TeacherAttemptDetailResponse>;
