using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.ToTable("exams");

        builder.ConfigureAuditableEntity();

        builder.Property(e => e.ClassroomId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(e => e.SubjectId)
            .HasColumnType("uuid");

        builder.Property(e => e.Title)
            .HasColumnType("varchar(256)")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnType("text");

        builder.HasOne(e => e.Classroom)
            .WithMany()
            .HasForeignKey(e => e.ClassroomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Subject)
            .WithMany(s => s.Exams)
            .HasForeignKey(e => e.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
