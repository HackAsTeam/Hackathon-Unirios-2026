using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Subjects.Commands;

public record CreateSubjectCommand(string Name, string? Description) : IRequest<SubjectResponse>;
