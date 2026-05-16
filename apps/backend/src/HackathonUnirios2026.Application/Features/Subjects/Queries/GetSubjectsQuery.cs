using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Subjects.Queries;

public record GetSubjectsQuery(Guid ClassroomId) : IRequest<List<SubjectResponse>>;
