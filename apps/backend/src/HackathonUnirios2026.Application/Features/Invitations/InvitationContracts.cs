namespace HackathonUnirios2026.Application.Features.Invitations;

public sealed class InvitationNotFoundException() : Exception("Invitation link not found or inactive.");
public sealed class InvitationExpiredException() : Exception("Invitation link has expired.");
public sealed class AlreadyEnrolledException() : Exception("Student is already enrolled in this classroom.");
public sealed class AlreadyClassroomTeacherException() : Exception("You are already the teacher of this classroom.");
