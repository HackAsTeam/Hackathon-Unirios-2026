using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Application.Features.ExamAttempts.Commands;
using HackathonUnirios2026.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Tests.Features.ExamAttempts;

public class StartExamAttemptCommandHandlerTests
{
    [Fact]
    public async Task Handle_CreatesNewAttempt_WhenStudentIsEnrolled()
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

        var handler = new StartExamAttemptCommandHandler(db, accessor);
        var result = await handler.Handle(new StartExamAttemptCommand(exam.Id), default);

        result.Status.Should().Be("InProgress");
        result.ExamId.Should().Be(exam.Id);
        result.StudentId.Should().Be(studentId);

        var count = await db.ExamAttempts.CountAsync();
        count.Should().Be(1);
    }

    [Fact]
    public async Task Handle_ReturnsExistingAttempt_WhenInProgressAttemptExists()
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
        var existing = db.AddAttempt(exam.Id, studentId, AttemptStatus.InProgress);

        var handler = new StartExamAttemptCommandHandler(db, accessor);
        var result = await handler.Handle(new StartExamAttemptCommand(exam.Id), default);

        result.Id.Should().Be(existing.Id);
        var count = await db.ExamAttempts.CountAsync();
        count.Should().Be(1);
    }

    [Fact]
    public async Task Handle_ThrowsNotEnrolledException_WhenExamNotFound()
    {
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new StartExamAttemptCommandHandler(db, accessor);
        var act = () => handler.Handle(new StartExamAttemptCommand(Guid.NewGuid()), default);

        await act.Should().ThrowAsync<NotEnrolledException>();
    }

    [Fact]
    public async Task Handle_ThrowsNotEnrolledException_WhenStudentNotEnrolled()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var (exam, _) = db.AddExamWithMcqQuestions(classroom.Id, teacherId);

        var handler = new StartExamAttemptCommandHandler(db, accessor);
        var act = () => handler.Handle(new StartExamAttemptCommand(exam.Id), default);

        await act.Should().ThrowAsync<NotEnrolledException>();
    }

    [Fact]
    public async Task Handle_CreatesNewAttempt_WhenExistingAttemptIsSubmitted()
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
        var submitted = db.AddAttempt(exam.Id, studentId, AttemptStatus.Submitted);

        var handler = new StartExamAttemptCommandHandler(db, accessor);
        var result = await handler.Handle(new StartExamAttemptCommand(exam.Id), default);

        result.Id.Should().NotBe(submitted.Id);
        result.Status.Should().Be("InProgress");
    }
}
