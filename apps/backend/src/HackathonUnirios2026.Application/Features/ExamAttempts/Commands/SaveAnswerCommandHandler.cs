using System.Security.Claims;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public sealed class SaveAnswerCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<SaveAnswerCommand, QuestionAnswerResponse>
{
    public async Task<QuestionAnswerResponse> Handle(SaveAnswerCommand cmd, CancellationToken ct)
    {
        var studentId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var attempt = await db.ExamAttempts
            .FirstOrDefaultAsync(a => a.Id == cmd.AttemptId && a.StudentId == studentId, ct);

        if (attempt is null)
            throw new AttemptNotFoundException();

        if (attempt.Status != AttemptStatus.InProgress)
            throw new AttemptNotInProgressException();

        var answer = await db.QuestionAnswers
            .FirstOrDefaultAsync(qa => qa.AttemptId == cmd.AttemptId && qa.QuestionId == cmd.QuestionId, ct);

        if (answer is null)
        {
            answer = new QuestionAnswer
            {
                AttemptId = cmd.AttemptId,
                QuestionId = cmd.QuestionId,
            };
            db.QuestionAnswers.Add(answer);
        }

        if (cmd.SelectedOptionId.HasValue)
        {
            var selectedOptionId = cmd.SelectedOptionId.Value;
            var question = await db.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == cmd.QuestionId, ct);
            var option = question?.Options.FirstOrDefault(o => o.Id == selectedOptionId);
            if (option is not null)
            {
                answer.SelectedOptionId = option.Id;
                answer.Score = option.IsCorrect ? 1 : 0;
                answer.AnswerText = null;
                answer.Format = null;
            }
        }
        else
        {
            answer.AnswerText = cmd.AnswerText;
            answer.Format = cmd.Format;
            answer.SelectedOptionId = null;
            answer.AnsweredAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);

        return new QuestionAnswerResponse(
            answer.Id,
            answer.QuestionId,
            answer.SelectedOptionId,
            answer.AnswerText,
            answer.Format,
            answer.Score,
            answer.Feedback,
            answer.AnsweredAt);
    }
}
