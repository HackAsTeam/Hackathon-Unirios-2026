namespace HackathonUnirios2026.Application.Features.Classrooms;

public class ClassroomNotFoundException() : Exception("Classroom not found.");
public class NotTeacherException() : Exception("Only the teacher of this classroom can perform this action.");
