using HackathonUnirios2026.Application.Features.Exams.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Exams.Commands;

public record CreateExamCommand(Guid SubjectId, string Title, string? Description, List<CreateQuestionDto> Questions) : IRequest<ExamDetailResponse>;
