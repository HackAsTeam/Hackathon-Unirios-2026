using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Exams;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public sealed class GetExamByIdQueryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<GetExamByIdQuery, ExamDetailResponse>
{
    public async Task<ExamDetailResponse> Handle(GetExamByIdQuery query, CancellationToken ct)
    {
        var userId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var exam = await db.Exams
            .Include(e => e.Questions.OrderBy(q => q.OrderIndex))
                .ThenInclude(q => q.Options.OrderBy(o => o.OrderIndex))
            .Include(e => e.Classroom)
                .ThenInclude(c => c.Enrollments)
            .FirstOrDefaultAsync(e => e.Id == query.ExamId, ct);

        if (exam is null)
            throw new ExamNotFoundException();

        if (exam.Classroom.TeacherId != userId && !exam.Classroom.Enrollments.Any(e => e.StudentId == userId))
            throw new ClassroomNotFoundException();

        return new ExamDetailResponse(
            exam.Id,
            exam.SubjectId,
            exam.ClassroomId,
            exam.Title,
            exam.Description,
            exam.Questions.Select(q => new QuestionResponse(
                q.Id,
                q.OrderIndex,
                q.Text,
                q.Options.Select(o => new QuestionOptionResponse(o.Id, o.OrderIndex, o.Text)).ToList())).ToList(),
            exam.CreatedAt);
    }
}
