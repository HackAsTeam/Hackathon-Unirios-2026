using HackathonUnirios2026.Domain.Enums;

namespace HackathonUnirios2026.Domain.Entities;

public class ExamAttempt : AuditableEntity
{
    public Guid ExamId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;
    public Exam Exam { get; set; } = null!;
    public ApplicationUser Student { get; set; } = null!;
    public ICollection<QuestionAnswer> Answers { get; set; } = [];
}
