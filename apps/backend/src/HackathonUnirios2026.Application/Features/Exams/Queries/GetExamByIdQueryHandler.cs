using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Exams;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public sealed class GetExamByIdQueryHandler(AppDbContext db) : IRequestHandler<GetExamByIdQuery, ExamDetailResponse>
{
    public async Task<ExamDetailResponse> Handle(GetExamByIdQuery query, CancellationToken ct)
    {
        var exam = await db.Exams
            .Include(e => e.Questions.OrderBy(q => q.OrderIndex))
            .FirstOrDefaultAsync(e => e.Id == query.ExamId, ct);

        if (exam is null)
            throw new ExamNotFoundException();

        return new ExamDetailResponse(
            exam.Id,
            exam.ClassroomId,
            exam.Title,
            exam.Description,
            exam.Questions.Select(q => new QuestionResponse(q.Id, q.OrderIndex, q.Text)).ToList(),
            exam.CreatedAt);
    }
}
