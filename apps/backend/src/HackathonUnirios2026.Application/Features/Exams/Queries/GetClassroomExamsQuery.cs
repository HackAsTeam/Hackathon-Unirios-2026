using HackathonUnirios2026.Application.Features.Exams.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public record GetClassroomExamsQuery(Guid ClassroomId) : IRequest<List<ExamResponse>>;
