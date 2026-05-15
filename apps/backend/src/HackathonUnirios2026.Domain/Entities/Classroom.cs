namespace HackathonUnirios2026.Domain.Entities;

public class Classroom
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid SubjectId { get; set; }
    public string TeacherId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Subject Subject { get; set; } = null!;
    public ApplicationUser Teacher { get; set; } = null!;
    public ICollection<Enrollment> Enrollments { get; set; } = [];
    public ICollection<InvitationLink> InvitationLinks { get; set; } = [];
    public ICollection<ClassroomExam> ClassroomExams { get; set; } = [];
}
