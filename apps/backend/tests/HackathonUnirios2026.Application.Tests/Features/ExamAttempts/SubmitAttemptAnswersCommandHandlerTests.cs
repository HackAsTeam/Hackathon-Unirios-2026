using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Application.Features.ExamAttempts.Commands;
using HackathonUnirios2026.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Tests.Features.ExamAttempts;

public class SubmitAttemptAnswersCommandHandlerTests
{
    [Fact]
    public async Task Handle_SetsStatusToSubmitted_AndCalculatesScore_WhenAllCorrect()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 2);
        var attempt = db.AddAttempt(exam.Id, studentId);

        var answers = exam.Questions
            .Select(q => new SubmitAttemptAnswerDto(q.Id, q.Options.First(o => o.IsCorrect).Id))
            .ToList();

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var result = await handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, answers), default);

        result.Status.Should().Be("Submitted");
        result.Score.Should().Be(2);
        result.SubmittedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_CalculatesPartialScore_WhenSomeAnswersAreWrong()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 2);
        var attempt = db.AddAttempt(exam.Id, studentId);

        var questions = exam.Questions.ToList();
        var answers = new List<SubmitAttemptAnswerDto>
        {
            new(questions[0].Id, questions[0].Options.First(o => o.IsCorrect).Id),
            new(questions[1].Id, questions[1].Options.First(o => !o.IsCorrect).Id),
        };

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var result = await handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, answers), default);

        result.Score.Should().Be(1);
    }

    [Fact]
    public async Task Handle_ThrowsAttemptNotFoundException_WhenAttemptNotFound()
    {
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var act = () => handler.Handle(new SubmitAttemptAnswersCommand(Guid.NewGuid(), []), default);

        await act.Should().ThrowAsync<AttemptNotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsAttemptNotFoundException_WhenAttemptBelongsToDifferentStudent()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var otherStudentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(otherStudentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        db.AddUser(otherStudentId, "other@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId);
        var attempt = db.AddAttempt(exam.Id, studentId);

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var act = () => handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, []), default);

        await act.Should().ThrowAsync<AttemptNotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsAttemptNotInProgressException_WhenStatusIsSubmitted()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId);
        var attempt = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var act = () => handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, []), default);

        await act.Should().ThrowAsync<AttemptNotInProgressException>();
    }

    [Fact]
    public async Task Handle_ThrowsInvalidAttemptAnswersException_WhenAnswerCountDoesNotMatchQuestions()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 2);
        var attempt = db.AddAttempt(exam.Id, studentId);

        var answers = new List<SubmitAttemptAnswerDto>
        {
            new(exam.Questions.First().Id, exam.Questions.First().Options.First(o => o.IsCorrect).Id),
        };

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var act = () => handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, answers), default);

        await act.Should().ThrowAsync<InvalidAttemptAnswersException>()
            .WithMessage("Submit exactly one answer*");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidAttemptAnswersException_WhenDuplicateQuestionIdSubmitted()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        // Need 2 questions so count check passes, then duplicate check fires
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 2);
        var attempt = db.AddAttempt(exam.Id, studentId);

        var firstQuestion = exam.Questions.First();
        var answers = new List<SubmitAttemptAnswerDto>
        {
            new(firstQuestion.Id, firstQuestion.Options.First(o => o.IsCorrect).Id),
            new(firstQuestion.Id, firstQuestion.Options.First(o => !o.IsCorrect).Id),
        };

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var act = () => handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, answers), default);

        await act.Should().ThrowAsync<InvalidAttemptAnswersException>()
            .WithMessage("Duplicate question answers*");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidAttemptAnswersException_WhenQuestionIdFromDifferentExam()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 1);
        var attempt = db.AddAttempt(exam.Id, studentId);

        var answers = new List<SubmitAttemptAnswerDto>
        {
            new(Guid.NewGuid(), Guid.NewGuid()),
        };

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var act = () => handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, answers), default);

        await act.Should().ThrowAsync<InvalidAttemptAnswersException>()
            .WithMessage("*does not belong to this activity*");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidAttemptAnswersException_WhenOptionDoesNotBelongToQuestion()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 1);
        var attempt = db.AddAttempt(exam.Id, studentId);

        var question = exam.Questions.First();
        var answers = new List<SubmitAttemptAnswerDto>
        {
            new(question.Id, Guid.NewGuid()),
        };

        var handler = new SubmitAttemptAnswersCommandHandler(db, accessor);
        var act = () => handler.Handle(new SubmitAttemptAnswersCommand(attempt.Id, answers), default);

        await act.Should().ThrowAsync<InvalidAttemptAnswersException>()
            .WithMessage("Selected option does not belong*");
    }
}
