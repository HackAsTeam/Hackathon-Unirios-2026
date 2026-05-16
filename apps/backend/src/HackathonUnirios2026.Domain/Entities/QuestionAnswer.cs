namespace HackathonUnirios2026.Domain.Entities;

public class QuestionAnswer : AuditableEntity
{
    public Guid AttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid? SelectedOptionId { get; set; }
    public string? AnswerText { get; set; }
    public decimal? Score { get; set; }
    public string? Feedback { get; set; }
    public DateTime AnsweredAt { get; set; }
    public ExamAttempt Attempt { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public QuestionOption? SelectedOption { get; set; }
}
