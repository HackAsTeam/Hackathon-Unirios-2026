using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Subjects;
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

        ValidateQuestions(cmd.Questions);

        var subject = await db.Subjects
            .Include(s => s.Classroom)
            .FirstOrDefaultAsync(s => s.Id == cmd.SubjectId, ct);

        if (subject is null)
            throw new SubjectNotFoundException();

        if (subject.Classroom.TeacherId != teacherId)
            throw new NotTeacherException();

        var exam = new Exam
        {
            ClassroomId = subject.ClassroomId,
            SubjectId = subject.Id,
            Title = cmd.Title,
            Description = cmd.Description,
            CreatedAt = DateTime.UtcNow,
            Questions = cmd.Questions.Select(q => new Question
            {
                OrderIndex = q.OrderIndex,
                Text = q.Text,
                Options = q.Options.Select(o => new QuestionOption
                {
                    OrderIndex = o.OrderIndex,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect,
                }).ToList(),
            }).ToList(),
        };

        db.Exams.Add(exam);
        await db.SaveChangesAsync(ct);

        return new ExamDetailResponse(
            exam.Id,
            exam.SubjectId,
            exam.ClassroomId,
            exam.Title,
            exam.Description,
            exam.Questions
                .OrderBy(q => q.OrderIndex)
                .Select(q => new QuestionResponse(
                    q.Id,
                    q.OrderIndex,
                    q.Text,
                    q.Options
                        .OrderBy(o => o.OrderIndex)
                        .Select(o => new QuestionOptionResponse(o.Id, o.OrderIndex, o.Text))
                        .ToList()))
                .ToList(),
            exam.CreatedAt);
    }

    private static void ValidateQuestions(List<CreateQuestionDto> questions)
    {
        if (questions is null || questions.Count == 0)
            throw new InvalidExamException("An activity must have at least one question.");

        foreach (var question in questions)
        {
            if (string.IsNullOrWhiteSpace(question.Text))
                throw new InvalidExamException("Question text is required.");

            if (question.Options is null || question.Options.Count < 2)
                throw new InvalidExamException("Each multiple-choice question must have at least two options.");

            if (question.Options.Count(o => o.IsCorrect) != 1)
                throw new InvalidExamException("Each multiple-choice question must have exactly one correct option.");

            if (question.Options.Any(o => string.IsNullOrWhiteSpace(o.Text)))
                throw new InvalidExamException("Question option text is required.");
        }
    }
}
