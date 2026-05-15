namespace HackathonUnirios2026.Application.Features.Classrooms.DTOs;

public record ClassroomResponse(
    Guid Id,
    string Title,
    string? Description,
    Guid SubjectId,
    string SubjectName,
    string TeacherId,
    string? TeacherName,
    DateTime CreatedAt);

public record ClassroomDetailResponse(
    Guid Id,
    string Title,
    string? Description,
    Guid SubjectId,
    string SubjectName,
    string TeacherId,
    string? TeacherName,
    DateTime CreatedAt,
    int EnrollmentCount);
