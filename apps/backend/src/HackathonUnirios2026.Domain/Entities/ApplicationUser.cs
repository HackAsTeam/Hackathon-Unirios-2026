using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Domain.Entities;

public enum UserRole { Student, Teacher }

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;
}
