using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Domain.Entities;

public enum UserRole { Student, Teacher }

public enum UserStatus
{
    Active,
    PendingDeletion,
    Anonymized,
    Purged,
    Suspended,
}

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime? DeletedAt { get; set; }
    public DateTime? PurgeAfter { get; set; }
}
