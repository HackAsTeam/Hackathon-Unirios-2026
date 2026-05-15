using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("questions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.Id)
            .HasColumnType("uuid")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(q => q.ExamId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(q => q.OrderIndex)
            .HasColumnType("integer")
            .IsRequired();

        builder.Property(q => q.Text)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(q => q.ExpectedAnswer)
            .HasColumnType("text");

        builder.HasOne(q => q.Exam)
            .WithMany(e => e.Questions)
            .HasForeignKey(q => q.ExamId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
