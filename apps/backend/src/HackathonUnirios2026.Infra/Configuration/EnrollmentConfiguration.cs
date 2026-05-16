using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("enrollments");

        builder.ConfigureAuditableEntity();

        builder.Property(e => e.ClassroomId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(e => e.StudentId)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(e => e.JoinedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasIndex(e => new { e.ClassroomId, e.StudentId }).IsUnique();

        builder.HasOne(e => e.Classroom)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.ClassroomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Student)
            .WithMany()
            .HasForeignKey(e => e.StudentId)
            .HasPrincipalKey(u => u.Id)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
