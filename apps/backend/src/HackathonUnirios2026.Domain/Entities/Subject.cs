namespace HackathonUnirios2026.Domain.Entities;

public class Subject : AuditableEntity
{
    public Guid ClassroomId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Classroom Classroom { get; set; } = null!;
    public ICollection<Exam> Exams { get; set; } = [];
}
