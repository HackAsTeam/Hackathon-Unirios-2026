using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class QuestionOptionConfiguration : IEntityTypeConfiguration<QuestionOption>
{
    public void Configure(EntityTypeBuilder<QuestionOption> builder)
    {
        builder.ToTable("question_options");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasColumnType("uuid")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(o => o.QuestionId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(o => o.OrderIndex)
            .HasColumnType("integer")
            .IsRequired();

        builder.Property(o => o.Text)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(o => o.IsCorrect)
            .HasColumnType("boolean")
            .IsRequired();

        builder.HasOne(o => o.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
