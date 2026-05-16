namespace HackathonUnirios2026.Domain.Entities;

public class InvitationLink : AuditableEntity
{
    public string Token { get; set; } = string.Empty;
    public Guid ClassroomId { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int UseCount { get; set; }
    public bool IsActive { get; set; } = true;
    public Classroom Classroom { get; set; } = null!;
}
