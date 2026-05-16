namespace HackathonUnirios2026.Application.Features.Exams;

public class ExamNotFoundException() : Exception("Exam not found.");
public class InvalidExamException(string message) : Exception(message);
