namespace HackathonUnirios2026.Domain.Entities;

public class ClassroomExam
{
    public Guid Id { get; set; }
    public Guid ClassroomId { get; set; }
    public Guid ExamId { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? DueAt { get; set; }
    public Classroom Classroom { get; set; } = null!;
    public Exam Exam { get; set; } = null!;
}
