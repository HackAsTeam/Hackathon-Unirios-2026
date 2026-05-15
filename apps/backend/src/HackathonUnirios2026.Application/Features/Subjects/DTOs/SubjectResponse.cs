namespace HackathonUnirios2026.Application.Features.Subjects.DTOs;

public record SubjectResponse(Guid Id, string Name, string? Description, DateTime CreatedAt);
