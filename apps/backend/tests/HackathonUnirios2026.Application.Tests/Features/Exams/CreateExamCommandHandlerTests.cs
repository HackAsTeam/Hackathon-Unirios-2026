using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Exams;
using HackathonUnirios2026.Application.Features.Exams.Commands;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Subjects;

namespace HackathonUnirios2026.Application.Tests.Features.Exams;

public class CreateExamCommandHandlerTests
{
    private static CreateQuestionDto OpenEndedQuestion(string text = "What is 2+2?") =>
        new(OrderIndex: 1, Text: text, Options: null);

    private static CreateQuestionDto McqQuestion(
        string text = "Choose one",
        int correctCount = 1,
        int totalOptions = 2) =>
        new(OrderIndex: 1, Text: text, Options: Enumerable.Range(1, totalOptions)
            .Select(i => new CreateQuestionOptionDto(i, $"Option {i}", i <= correctCount))
            .ToList());

    [Fact]
    public async Task Handle_ReturnsExamDetailResponse_WhenExamIsValid()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var (_, subject) = db.AddExamWithMcqQuestions(classroom.Id, teacherId);

        var handler = new CreateExamCommandHandler(db, accessor);
        var result = await handler.Handle(
            new CreateExamCommand(subject.Id, "Quiz 1", null, [OpenEndedQuestion()]), default);

        result.Title.Should().Be("Quiz 1");
        result.Questions.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_CreatesMcqExam_WithTwoOptionsAndOneCorrect()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var (_, subject) = db.AddExamWithMcqQuestions(classroom.Id, teacherId);

        var handler = new CreateExamCommandHandler(db, accessor);
        var result = await handler.Handle(
            new CreateExamCommand(subject.Id, "MCQ Test", null, [McqQuestion()]), default);

        result.Questions[0].Options.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_ThrowsInvalidExamException_WhenNoQuestions()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(new CreateExamCommand(Guid.NewGuid(), "Empty", null, []), default);

        await act.Should().ThrowAsync<InvalidExamException>()
            .WithMessage("*at least one question*");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidExamException_WhenQuestionTextIsEmpty()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(
            new CreateExamCommand(Guid.NewGuid(), "Quiz", null, [OpenEndedQuestion("")]), default);

        await act.Should().ThrowAsync<InvalidExamException>()
            .WithMessage("Question text is required.");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidExamException_WhenMcqHasOnlyOneOption()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var singleOptionQuestion = new CreateQuestionDto(1, "Choose", [
            new CreateQuestionOptionDto(1, "Only one", true)
        ]);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(new CreateExamCommand(Guid.NewGuid(), "Quiz", null, [singleOptionQuestion]), default);

        await act.Should().ThrowAsync<InvalidExamException>()
            .WithMessage("*at least two options*");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidExamException_WhenMcqHasZeroCorrectOptions()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var question = new CreateQuestionDto(1, "Choose", [
            new CreateQuestionOptionDto(1, "A", false),
            new CreateQuestionOptionDto(2, "B", false),
        ]);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(new CreateExamCommand(Guid.NewGuid(), "Quiz", null, [question]), default);

        await act.Should().ThrowAsync<InvalidExamException>()
            .WithMessage("*exactly one correct option*");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidExamException_WhenMcqHasTwoCorrectOptions()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(
            new CreateExamCommand(Guid.NewGuid(), "Quiz", null, [McqQuestion(correctCount: 2, totalOptions: 2)]), default);

        await act.Should().ThrowAsync<InvalidExamException>()
            .WithMessage("*exactly one correct option*");
    }

    [Fact]
    public async Task Handle_ThrowsInvalidExamException_WhenOptionTextIsEmpty()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var question = new CreateQuestionDto(1, "Choose", [
            new CreateQuestionOptionDto(1, "", true),
            new CreateQuestionOptionDto(2, "B", false),
        ]);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(new CreateExamCommand(Guid.NewGuid(), "Quiz", null, [question]), default);

        await act.Should().ThrowAsync<InvalidExamException>()
            .WithMessage("Question option text is required.");
    }

    [Fact]
    public async Task Handle_ThrowsSubjectNotFoundException_WhenSubjectDoesNotExist()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(
            new CreateExamCommand(Guid.NewGuid(), "Quiz", null, [OpenEndedQuestion()]), default);

        await act.Should().ThrowAsync<SubjectNotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsNotTeacherException_WhenUserIsNotTeacher()
    {
        var teacherId = Guid.NewGuid().ToString();
        var otherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(otherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(otherId, "other@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var (_, subject) = db.AddExamWithMcqQuestions(classroom.Id, teacherId);

        var handler = new CreateExamCommandHandler(db, accessor);
        var act = () => handler.Handle(
            new CreateExamCommand(subject.Id, "Quiz", null, [OpenEndedQuestion()]), default);

        await act.Should().ThrowAsync<NotTeacherException>();
    }
}
