using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Subjects.Commands;

public record CreateSubjectCommand(Guid ClassroomId, string Name, string? Description, string TeacherId) : IRequest<SubjectResponse>;
