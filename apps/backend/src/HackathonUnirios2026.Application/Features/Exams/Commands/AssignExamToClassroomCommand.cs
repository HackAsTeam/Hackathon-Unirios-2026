using HackathonUnirios2026.Application.Features.Exams.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Exams.Commands;

public record AssignExamToClassroomCommand(Guid ExamId, Guid ClassroomId, DateTime? DueAt) : IRequest<ClassroomExamResponse>;
