namespace HackathonUnirios2026.Application.Features.Subjects.DTOs;

public record SubjectResponse(Guid Id, Guid ClassroomId, string Name, string? Description, string CreatedBy, DateTime CreatedAt);
