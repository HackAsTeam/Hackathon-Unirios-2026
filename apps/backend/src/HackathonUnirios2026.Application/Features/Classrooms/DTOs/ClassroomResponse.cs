using HackathonUnirios2026.Application.Features.Subjects.DTOs;

namespace HackathonUnirios2026.Application.Features.Classrooms.DTOs;

public record ClassroomResponse(
    Guid Id,
    string Title,
    string? Description,
    string TeacherId,
    string? TeacherName,
    DateTime CreatedAt,
    List<SubjectResponse> Subjects);

public record ClassroomDetailResponse(
    Guid Id,
    string Title,
    string? Description,
    string TeacherId,
    string? TeacherName,
    DateTime CreatedAt,
    int EnrollmentCount,
    List<SubjectResponse> Subjects);
