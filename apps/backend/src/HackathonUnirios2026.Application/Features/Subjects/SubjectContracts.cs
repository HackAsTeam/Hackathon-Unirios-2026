namespace HackathonUnirios2026.Application.Features.Subjects;

// SubjectNotFoundException is reserved for future delete/get-by-id operations.
public sealed class SubjectNotFoundException() : Exception("Subject not found.");
