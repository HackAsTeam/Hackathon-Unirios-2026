using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Classrooms.Commands;

public record CreateClassroomCommand(string Title, string? Description, Guid SubjectId) : IRequest<ClassroomResponse>;
