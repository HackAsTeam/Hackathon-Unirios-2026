using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}
