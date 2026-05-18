namespace HackathonUnirios2026.Application.Features.Classrooms;

public sealed class ClassroomNotFoundException() : Exception("Classroom not found.");
public sealed class NotTeacherException() : Exception("Only the teacher of this classroom can perform this action.");
