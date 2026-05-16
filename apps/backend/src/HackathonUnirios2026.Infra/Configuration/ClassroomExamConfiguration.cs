using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class ClassroomExamConfiguration : IEntityTypeConfiguration<ClassroomExam>
{
    public void Configure(EntityTypeBuilder<ClassroomExam> builder)
    {
        builder.ToTable("classroom_exams");

        builder.ConfigureAuditableEntity();

        builder.Property(ce => ce.ClassroomId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(ce => ce.ExamId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(ce => ce.AssignedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(ce => ce.DueAt)
            .HasColumnType("timestamp with time zone");

        builder.HasIndex(ce => new { ce.ClassroomId, ce.ExamId }).IsUnique();

        builder.HasOne(ce => ce.Classroom)
            .WithMany(c => c.ClassroomExams)
            .HasForeignKey(ce => ce.ClassroomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ce => ce.Exam)
            .WithMany(e => e.ClassroomExams)
            .HasForeignKey(ce => ce.ExamId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
