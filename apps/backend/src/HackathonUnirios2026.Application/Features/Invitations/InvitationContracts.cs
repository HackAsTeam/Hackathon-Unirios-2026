namespace HackathonUnirios2026.Application.Features.Invitations;

public class InvitationNotFoundException() : Exception("Invitation link not found or inactive.");
public class InvitationExpiredException() : Exception("Invitation link has expired.");
public class AlreadyEnrolledException() : Exception("Student is already enrolled in this classroom.");
public class NotTeacherException() : Exception("Only the teacher of this classroom can perform this action.");
