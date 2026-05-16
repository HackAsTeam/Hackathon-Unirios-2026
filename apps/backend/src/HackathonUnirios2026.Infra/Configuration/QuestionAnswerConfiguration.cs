using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class QuestionAnswerConfiguration : IEntityTypeConfiguration<QuestionAnswer>
{
    public void Configure(EntityTypeBuilder<QuestionAnswer> builder)
    {
        builder.ToTable("question_answers");

        builder.ConfigureAuditableEntity();

        builder.Property(qa => qa.AttemptId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(qa => qa.QuestionId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(qa => qa.SelectedOptionId)
            .HasColumnType("uuid");

        builder.Property(qa => qa.AnswerText)
            .HasColumnType("text");

        builder.Property(qa => qa.Score)
            .HasColumnType("numeric(5,2)");

        builder.Property(qa => qa.Feedback)
            .HasColumnType("text");

        builder.Property(qa => qa.AnsweredAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasIndex(qa => new { qa.AttemptId, qa.QuestionId }).IsUnique();

        builder.HasOne(qa => qa.Attempt)
            .WithMany(a => a.Answers)
            .HasForeignKey(qa => qa.AttemptId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(qa => qa.Question)
            .WithMany()
            .HasForeignKey(qa => qa.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(qa => qa.SelectedOption)
            .WithMany()
            .HasForeignKey(qa => qa.SelectedOptionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
