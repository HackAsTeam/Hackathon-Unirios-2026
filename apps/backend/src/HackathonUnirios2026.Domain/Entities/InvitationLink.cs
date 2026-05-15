namespace HackathonUnirios2026.Domain.Entities;

public class InvitationLink
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public Guid ClassroomId { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? MaxUses { get; set; }
    public int UseCount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public Classroom Classroom { get; set; } = null!;
}
