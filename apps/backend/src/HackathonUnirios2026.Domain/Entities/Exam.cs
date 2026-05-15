namespace HackathonUnirios2026.Domain.Entities;

public class Exam
{
    public Guid Id { get; set; }
    public Guid ClassroomId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public Classroom Classroom { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<ClassroomExam> ClassroomExams { get; set; } = [];
}
