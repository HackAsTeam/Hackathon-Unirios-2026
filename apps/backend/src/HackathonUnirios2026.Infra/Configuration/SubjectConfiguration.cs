using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.ToTable("subjects");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnType("uuid")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(s => s.Name)
            .HasColumnType("varchar(256)")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(s => s.Description)
            .HasColumnType("text");

        builder.Property(s => s.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();
    }
}
