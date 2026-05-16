namespace HackathonUnirios2026.Application.Features.ExamAttempts;

public class AttemptNotFoundException() : Exception("Attempt not found.");
public class AttemptNotInProgressException() : Exception("Attempt is not in progress.");
public class NotEnrolledException() : Exception("Student is not enrolled in a classroom with this exam.");
public class InvalidAttemptAnswersException(string message) : Exception(message);
