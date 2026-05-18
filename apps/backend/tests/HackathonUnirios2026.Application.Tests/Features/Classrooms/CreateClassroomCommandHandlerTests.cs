using HackathonUnirios2026.Application.Features.Classrooms.Commands;
using HackathonUnirios2026.Infra.Database;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Tests.Features.Classrooms;

public class CreateClassroomCommandHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsClassroomResponse_WithCorrectData()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");

        var handler = new CreateClassroomCommandHandler(db, accessor);
        var result = await handler.Handle(new CreateClassroomCommand("Math 101", "A classroom"), default);

        result.Title.Should().Be("Math 101");
        result.Description.Should().Be("A classroom");
        result.TeacherId.Should().Be(teacherId);
        result.Subjects.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_PersistsClassroom_InDatabase()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);
        db.AddUser(teacherId, "teacher@test.com");

        var handler = new CreateClassroomCommandHandler(db, accessor);
        await handler.Handle(new CreateClassroomCommand("Science", null), default);

        var count = await db.Classrooms.CountAsync();
        count.Should().Be(1);
    }

    [Fact]
    public async Task Handle_SetsTeacherId_FromHttpContext()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);
        db.AddUser(teacherId, "teacher@test.com");

        var handler = new CreateClassroomCommandHandler(db, accessor);
        var result = await handler.Handle(new CreateClassroomCommand("History", null), default);

        result.TeacherId.Should().Be(teacherId);
    }
}
