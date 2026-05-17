using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("asp_net_users");

        builder.Property(user => user.DisplayName)
            .HasColumnType("varchar(256)")
            .HasMaxLength(256);

        builder.Property(user => user.AvatarUrl)
            .HasColumnType("text");

        builder.Property(user => user.Role)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(UserRole.Student);
    }
}
