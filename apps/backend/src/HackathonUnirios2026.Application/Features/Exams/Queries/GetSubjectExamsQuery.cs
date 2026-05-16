using HackathonUnirios2026.Application.Features.Exams.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public record GetSubjectExamsQuery(Guid SubjectId) : IRequest<List<ExamResponse>>;
