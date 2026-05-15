using HackathonUnirios2026.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HackathonUnirios2026.Infra.Configuration;

public sealed class ClassroomConfiguration : IEntityTypeConfiguration<Classroom>
{
    public void Configure(EntityTypeBuilder<Classroom> builder)
    {
        builder.ToTable("classrooms");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnType("uuid")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(c => c.Title)
            .HasColumnType("varchar(256)")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(c => c.Description)
            .HasColumnType("text");

        builder.Property(c => c.SubjectId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(c => c.TeacherId)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasOne(c => c.Subject)
            .WithMany(s => s.Classrooms)
            .HasForeignKey(c => c.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Teacher)
            .WithMany()
            .HasForeignKey(c => c.TeacherId)
            .HasPrincipalKey(u => u.Id)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
