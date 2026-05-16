namespace HackathonUnirios2026.Domain.Entities;

public class Exam : AuditableEntity
{
    public Guid ClassroomId { get; set; }
    public Guid? SubjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Classroom Classroom { get; set; } = null!;
    public Subject? Subject { get; set; }
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<ClassroomExam> ClassroomExams { get; set; } = [];
}
