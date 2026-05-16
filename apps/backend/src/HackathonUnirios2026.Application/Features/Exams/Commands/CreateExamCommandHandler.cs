using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Commands;

public sealed class CreateExamCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<CreateExamCommand, ExamDetailResponse>
{
    public async Task<ExamDetailResponse> Handle(CreateExamCommand cmd, CancellationToken ct)
    {
        var teacherId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var classroom = await db.Classrooms.FirstOrDefaultAsync(c => c.Id == cmd.ClassroomId, ct);
        if (classroom is null || classroom.TeacherId != teacherId)
            throw new NotTeacherException();

        var exam = new Exam
        {
            ClassroomId = cmd.ClassroomId,
            Title = cmd.Title,
            Description = cmd.Description,
            CreatedAt = DateTime.UtcNow,
            Questions = cmd.Questions.Select(q => new Question
            {
                OrderIndex = q.OrderIndex,
                Text = q.Text,
                ExpectedAnswer = q.ExpectedAnswer,
            }).ToList(),
        };

        db.Exams.Add(exam);
        await db.SaveChangesAsync(ct);

        return new ExamDetailResponse(
            exam.Id,
            exam.ClassroomId,
            exam.Title,
            exam.Description,
            exam.Questions.OrderBy(q => q.OrderIndex).Select(q => new QuestionResponse(q.Id, q.OrderIndex, q.Text)).ToList(),
            exam.CreatedAt);
    }
}
