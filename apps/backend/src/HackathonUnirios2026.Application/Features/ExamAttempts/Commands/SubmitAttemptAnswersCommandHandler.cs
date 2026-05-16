using System.Security.Claims;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Features.ExamAttempts.Commands;

public sealed class SubmitAttemptAnswersCommandHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<SubmitAttemptAnswersCommand, SubmitAnswersResponse>
{
    public async Task<SubmitAnswersResponse> Handle(SubmitAttemptAnswersCommand cmd, CancellationToken ct)
    {
        var studentId = httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var attempt = await db.ExamAttempts
            .Include(a => a.Answers)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(a => a.Id == cmd.AttemptId && a.StudentId == studentId, ct);

        if (attempt is null)
            throw new AttemptNotFoundException();

        if (attempt.Status != AttemptStatus.InProgress)
            throw new AttemptNotInProgressException();

        ValidateAnswers(attempt, cmd.Answers);

        var answersByQuestionId = cmd.Answers.ToDictionary(a => a.QuestionId);
        var now = DateTime.UtcNow;
        decimal score = 0;

        foreach (var question in attempt.Exam.Questions)
        {
            var submittedAnswer = answersByQuestionId[question.Id];
            var selectedOption = question.Options.First(o => o.Id == submittedAnswer.SelectedOptionId);
            var answer = attempt.Answers.FirstOrDefault(a => a.QuestionId == question.Id);

            if (answer is null)
            {
                answer = new QuestionAnswer
                {
                    AttemptId = attempt.Id,
                    QuestionId = question.Id,
                };
                db.QuestionAnswers.Add(answer);
            }

            answer.SelectedOptionId = selectedOption.Id;
            answer.AnswerText = selectedOption.Text;
            answer.Score = selectedOption.IsCorrect ? 1 : 0;
            answer.AnsweredAt = now;

            score += answer.Score.Value;
        }

        attempt.Status = AttemptStatus.Submitted;
        attempt.SubmittedAt = now;

        await db.SaveChangesAsync(ct);

        return new SubmitAnswersResponse(
            attempt.Id,
            attempt.ExamId,
            attempt.StudentId,
            attempt.StartedAt,
            attempt.SubmittedAt,
            attempt.Status.ToString(),
            attempt.Exam.Questions.Count,
            attempt.Exam.Questions.Count,
            score);
    }

    private static void ValidateAnswers(ExamAttempt attempt, List<SubmitAttemptAnswerDto> answers)
    {
        var questions = attempt.Exam.Questions.ToList();
        var questionIds = questions.Select(q => q.Id).ToHashSet();
        var submittedQuestionIds = answers.Select(a => a.QuestionId).ToList();

        if (answers is null || answers.Count != questions.Count)
            throw new InvalidAttemptAnswersException("Submit exactly one answer for each activity question.");

        if (submittedQuestionIds.Distinct().Count() != submittedQuestionIds.Count)
            throw new InvalidAttemptAnswersException("Duplicate question answers are not allowed.");

        if (submittedQuestionIds.Any(questionId => !questionIds.Contains(questionId)))
            throw new InvalidAttemptAnswersException("Submitted answers contain a question that does not belong to this activity.");

        if (questionIds.Any(questionId => !submittedQuestionIds.Contains(questionId)))
            throw new InvalidAttemptAnswersException("Submitted answers are missing one or more activity questions.");

        foreach (var answer in answers)
        {
            var question = questions.First(q => q.Id == answer.QuestionId);
            if (question.Options.All(o => o.Id != answer.SelectedOptionId))
                throw new InvalidAttemptAnswersException("Selected option does not belong to the submitted question.");
        }
    }
}
