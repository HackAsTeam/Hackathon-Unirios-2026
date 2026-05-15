using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.ToTable("exams");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnType("uuid")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(e => e.ClassroomId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(e => e.Title)
            .HasColumnType("varchar(256)")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnType("text");

        builder.Property(e => e.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasOne(e => e.Classroom)
            .WithMany()
            .HasForeignKey(e => e.ClassroomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
