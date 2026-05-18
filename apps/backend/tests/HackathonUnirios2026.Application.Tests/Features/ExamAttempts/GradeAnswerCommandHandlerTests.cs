using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Application.Features.ExamAttempts.Commands;
using HackathonUnirios2026.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Tests.Features.ExamAttempts;

public class GradeAnswerCommandHandlerTests
{
    [Fact]
    public async Task Handle_UpdatesScoreAndFeedback_WhenTeacherGrades()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 1);
        var attempt = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);
        var question = exam.Questions.First();
        var answer = db.AddAnswer(attempt.Id, question.Id);

        var handler = new GradeAnswerCommandHandler(db, accessor);
        var result = await handler.Handle(new GradeAnswerCommand(attempt.Id, answer.Id, 1m, "Well done!"), default);

        result.Score.Should().Be(1m);
        result.Feedback.Should().Be("Well done!");
    }

    [Fact]
    public async Task Handle_TransitionsToGraded_WhenAllAnswersHaveScore()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 2);
        var attempt = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);

        var questions = exam.Questions.ToList();
        db.AddAnswer(attempt.Id, questions[0].Id, score: 1m);
        var answer2 = db.AddAnswer(attempt.Id, questions[1].Id);

        var handler = new GradeAnswerCommandHandler(db, accessor);
        await handler.Handle(new GradeAnswerCommand(attempt.Id, answer2.Id, 1m, null), default);

        var updatedAttempt = await db.ExamAttempts.FindAsync(attempt.Id);
        updatedAttempt!.Status.Should().Be(AttemptStatus.Graded);
    }

    [Fact]
    public async Task Handle_DoesNotTransitionToGraded_WhenSomeAnswersAreUnscored()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 2);
        var attempt = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);

        var questions = exam.Questions.ToList();
        var answer1 = db.AddAnswer(attempt.Id, questions[0].Id);
        db.AddAnswer(attempt.Id, questions[1].Id);

        var handler = new GradeAnswerCommandHandler(db, accessor);
        await handler.Handle(new GradeAnswerCommand(attempt.Id, answer1.Id, 1m, null), default);

        var updatedAttempt = await db.ExamAttempts.FindAsync(attempt.Id);
        updatedAttempt!.Status.Should().Be(AttemptStatus.Submitted);
    }

    [Fact]
    public async Task Handle_ThrowsAttemptNotFoundException_WhenAttemptNotFound()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new GradeAnswerCommandHandler(db, accessor);
        var act = () => handler.Handle(new GradeAnswerCommand(Guid.NewGuid(), Guid.NewGuid(), 1m, null), default);

        await act.Should().ThrowAsync<AttemptNotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsNotTeacherException_WhenCallerIsNotClassroomTeacher()
    {
        var teacherId = Guid.NewGuid().ToString();
        var otherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(otherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(otherId, "other@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 1);
        var attempt = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);

        var handler = new GradeAnswerCommandHandler(db, accessor);
        var act = () => handler.Handle(new GradeAnswerCommand(attempt.Id, Guid.NewGuid(), 1m, null), default);

        await act.Should().ThrowAsync<NotTeacherException>();
    }

    [Fact]
    public async Task Handle_ThrowsAttemptNotFoundException_WhenAnswerNotFound()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 1);
        var attempt = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);

        var handler = new GradeAnswerCommandHandler(db, accessor);
        var act = () => handler.Handle(new GradeAnswerCommand(attempt.Id, Guid.NewGuid(), 1m, null), default);

        await act.Should().ThrowAsync<AttemptNotFoundException>();
    }

    [Fact]
    public async Task Handle_UpdatesOnlyFeedback_WhenScoreIsNull()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId, questionCount: 1);
        var attempt = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);
        var question = exam.Questions.First();
        var answer = db.AddAnswer(attempt.Id, question.Id, score: 0.5m);

        var handler = new GradeAnswerCommandHandler(db, accessor);
        var result = await handler.Handle(new GradeAnswerCommand(attempt.Id, answer.Id, null, "Good try"), default);

        result.Score.Should().Be(0.5m);
        result.Feedback.Should().Be("Good try");
    }
}
