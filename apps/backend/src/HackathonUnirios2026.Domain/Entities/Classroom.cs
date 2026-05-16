namespace HackathonUnirios2026.Domain.Entities;

public class Classroom : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string TeacherId { get; set; } = string.Empty;
    public ApplicationUser Teacher { get; set; } = null!;
    public ICollection<Subject> Subjects { get; set; } = [];
    public ICollection<Enrollment> Enrollments { get; set; } = [];
    public ICollection<InvitationLink> InvitationLinks { get; set; } = [];
    public ICollection<ClassroomExam> ClassroomExams { get; set; } = [];
}
