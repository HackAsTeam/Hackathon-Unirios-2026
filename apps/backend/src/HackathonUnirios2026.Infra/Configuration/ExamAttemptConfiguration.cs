using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class ExamAttemptConfiguration : IEntityTypeConfiguration<ExamAttempt>
{
    public void Configure(EntityTypeBuilder<ExamAttempt> builder)
    {
        builder.ToTable("exam_attempts");

        builder.ConfigureAuditableEntity();

        builder.Property(a => a.ExamId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(a => a.StudentId)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(a => a.StartedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(a => a.SubmittedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(AttemptStatus.InProgress)
            .IsRequired();

        builder.HasOne(a => a.Exam)
            .WithMany()
            .HasForeignKey(a => a.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Student)
            .WithMany()
            .HasForeignKey(a => a.StudentId)
            .HasPrincipalKey(u => u.Id)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
