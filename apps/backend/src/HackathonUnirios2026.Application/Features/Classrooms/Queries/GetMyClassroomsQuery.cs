using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Classrooms.Queries;

public record GetMyClassroomsQuery(string UserId) : IRequest<List<ClassroomResponse>>;
