using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Classrooms.Queries;

namespace HackathonUnirios2026.Application.Tests.Features.Classrooms;

public class GetClassroomByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsClassroomDetail_WhenUserIsTeacher()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Science", teacher);

        var handler = new GetClassroomByIdQueryHandler(db, accessor);
        var result = await handler.Handle(new GetClassroomByIdQuery(classroom.Id), default);

        result.Id.Should().Be(classroom.Id);
        result.Title.Should().Be("Science");
    }

    [Fact]
    public async Task Handle_ReturnsClassroomDetail_WithEnrollmentCount_WhenUserIsEnrolledStudent()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);

        var handler = new GetClassroomByIdQueryHandler(db, accessor);
        var result = await handler.Handle(new GetClassroomByIdQuery(classroom.Id), default);

        result.Id.Should().Be(classroom.Id);
        result.EnrollmentCount.Should().Be(1);
    }

    [Fact]
    public async Task Handle_ThrowsClassroomNotFoundException_WhenClassroomDoesNotExist()
    {
        var userId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(userId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new GetClassroomByIdQueryHandler(db, accessor);
        var act = () => handler.Handle(new GetClassroomByIdQuery(Guid.NewGuid()), default);

        await act.Should().ThrowAsync<ClassroomNotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsClassroomNotFoundException_WhenUserHasNoAccess()
    {
        var teacherId = Guid.NewGuid().ToString();
        var userId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(userId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(userId, "user@test.com");
        var classroom = db.AddClassroom(teacherId, "Private", teacher);

        var handler = new GetClassroomByIdQueryHandler(db, accessor);
        var act = () => handler.Handle(new GetClassroomByIdQuery(classroom.Id), default);

        await act.Should().ThrowAsync<ClassroomNotFoundException>();
    }
}
