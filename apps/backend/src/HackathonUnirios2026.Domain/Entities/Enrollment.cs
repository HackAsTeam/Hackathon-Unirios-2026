namespace HackathonUnirios2026.Domain.Entities;

public class Enrollment
{
    public Guid Id { get; set; }
    public Guid ClassroomId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
    public Classroom Classroom { get; set; } = null!;
    public ApplicationUser Student { get; set; } = null!;
}
