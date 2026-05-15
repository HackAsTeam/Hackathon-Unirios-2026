using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.Exams.Queries;

public sealed class GetClassroomExamsQueryHandler(AppDbContext db)
    : IRequestHandler<GetClassroomExamsQuery, List<ExamResponse>>
{
    public async Task<List<ExamResponse>> Handle(GetClassroomExamsQuery query, CancellationToken ct)
    {
        return await db.ClassroomExams
            .Where(ce => ce.ClassroomId == query.ClassroomId)
            .Include(ce => ce.Exam)
                .ThenInclude(e => e.Questions)
            .Select(ce => new ExamResponse(
                ce.Exam.Id,
                ce.Exam.ClassroomId,
                ce.Exam.Title,
                ce.Exam.Description,
                ce.Exam.Questions.Count,
                ce.Exam.CreatedAt))
            .ToListAsync(ct);
    }
}
