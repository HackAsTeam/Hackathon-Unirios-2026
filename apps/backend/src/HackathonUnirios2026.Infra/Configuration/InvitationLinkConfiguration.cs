using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class InvitationLinkConfiguration : IEntityTypeConfiguration<InvitationLink>
{
    public void Configure(EntityTypeBuilder<InvitationLink> builder)
    {
        builder.ToTable("invitation_links");

        builder.ConfigureAuditableEntity();

        builder.Property(i => i.Token)
            .HasColumnType("varchar(64)")
            .HasMaxLength(64)
            .IsRequired();

        builder.HasIndex(i => i.Token).IsUnique();

        builder.Property(i => i.ClassroomId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(i => i.ExpiresAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(i => i.UseCount)
            .HasColumnType("integer")
            .IsRequired();

        builder.Property(i => i.IsActive)
            .HasColumnType("boolean")
            .IsRequired();

        builder.HasOne(i => i.Classroom)
            .WithMany(c => c.InvitationLinks)
            .HasForeignKey(i => i.ClassroomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
