using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.ToTable("subjects");

        builder.ConfigureAuditableEntity();

        builder.Property(s => s.ClassroomId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(s => s.Name)
            .HasColumnType("varchar(256)")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(s => s.Description)
            .HasColumnType("text");

        builder.HasOne(s => s.Classroom)
            .WithMany(c => c.Subjects)
            .HasForeignKey(s => s.ClassroomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
