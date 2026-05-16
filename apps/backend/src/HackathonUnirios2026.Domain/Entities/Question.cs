namespace HackathonUnirios2026.Domain.Entities;

public class Question
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public int OrderIndex { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ExpectedAnswer { get; set; }
    public Exam Exam { get; set; } = null!;
    public ICollection<QuestionOption> Options { get; set; } = [];
}
