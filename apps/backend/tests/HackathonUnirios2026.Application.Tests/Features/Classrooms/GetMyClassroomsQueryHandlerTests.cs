using HackathonUnirios2026.Application.Features.Classrooms.Queries;

namespace HackathonUnirios2026.Application.Tests.Features.Classrooms;

public class GetMyClassroomsQueryHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsClassrooms_WhereUserIsTeacher()
    {
        var teacherId = Guid.NewGuid().ToString();
        var otherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var other = db.AddUser(otherId, "other@test.com");
        db.AddClassroom(teacherId, "My Classroom", teacher);
        db.AddClassroom(otherId, "Other Classroom", other);

        var handler = new GetMyClassroomsQueryHandler(db);
        var result = await handler.Handle(new GetMyClassroomsQuery(teacherId), default);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("My Classroom");
    }

    [Fact]
    public async Task Handle_ReturnsClassrooms_WhereUserIsEnrolledStudent()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);

        var handler = new GetMyClassroomsQueryHandler(db);
        var result = await handler.Handle(new GetMyClassroomsQuery(studentId), default);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Math");
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenUserHasNoClassrooms()
    {
        var userId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(userId);
        using var db = DbContextFactory.Create(accessor);
        db.AddUser(userId, "user@test.com");

        var handler = new GetMyClassroomsQueryHandler(db);
        var result = await handler.Handle(new GetMyClassroomsQuery(userId), default);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_DoesNotReturnClassroom_WhenUserHasNoRelation()
    {
        var teacherId = Guid.NewGuid().ToString();
        var userId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(userId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(userId, "user@test.com");
        db.AddClassroom(teacherId, "Not Mine", teacher);

        var handler = new GetMyClassroomsQueryHandler(db);
        var result = await handler.Handle(new GetMyClassroomsQuery(userId), default);

        result.Should().BeEmpty();
    }
}
