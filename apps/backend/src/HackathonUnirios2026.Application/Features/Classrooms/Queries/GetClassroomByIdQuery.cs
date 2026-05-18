using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public record GetClassroomByIdQuery(Guid ClassroomId, string UserId) : IRequest<ClassroomDetailResponse>;
