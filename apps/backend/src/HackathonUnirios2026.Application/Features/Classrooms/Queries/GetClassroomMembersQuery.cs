using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public record GetClassroomMembersQuery(Guid ClassroomId, string RequestingUserId)
    : IRequest<List<ClassroomMemberResponse>>;
