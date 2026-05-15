using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Exams;
using HackathonUnirios2026.Application.Features.Invitations;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Commands;

public sealed class AssignExamToClassroomCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<AssignExamToClassroomCommand, ClassroomExamResponse>
{
    public async Task<ClassroomExamResponse> Handle(AssignExamToClassroomCommand cmd, CancellationToken ct)
    {
        var teacherId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var classroom = await db.Classrooms.FirstOrDefaultAsync(c => c.Id == cmd.ClassroomId, ct);
        if (classroom is null || classroom.TeacherId != teacherId)
            throw new NotTeacherException();

        var exam = await db.Exams.FirstOrDefaultAsync(e => e.Id == cmd.ExamId, ct);
        if (exam is null)
            throw new ExamNotFoundException();

        var examClassroom = await db.Classrooms.FirstOrDefaultAsync(c => c.Id == exam.ClassroomId, ct);
        if (examClassroom is null || examClassroom.TeacherId != teacherId)
            throw new NotTeacherException();

        var classroomExam = new ClassroomExam
        {
            ClassroomId = cmd.ClassroomId,
            ExamId = cmd.ExamId,
            AssignedAt = DateTime.UtcNow,
            DueAt = cmd.DueAt,
        };

        db.ClassroomExams.Add(classroomExam);
        await db.SaveChangesAsync(ct);

        return new ClassroomExamResponse(
            classroomExam.Id,
            classroomExam.ClassroomId,
            classroomExam.ExamId,
            classroomExam.AssignedAt,
            classroomExam.DueAt);
    }
}
