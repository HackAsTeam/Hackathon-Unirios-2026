using HackathonUnirios2026.Application.Features.Invitations;
using HackathonUnirios2026.Application.Features.Invitations.Commands;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Tests.Features.Invitations;

public class JoinClassroomByTokenCommandHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsEnrollment_WhenTokenIsValid()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var token = Guid.NewGuid().ToString("N");
        db.AddInvitationLink(classroom.Id, token);

        var handler = new JoinClassroomByTokenCommandHandler(db, accessor);
        var result = await handler.Handle(new JoinClassroomByTokenCommand(token), default);

        result.StudentId.Should().Be(studentId);
        result.ClassroomId.Should().Be(classroom.Id);
        result.ClassroomTitle.Should().Be("Math");

        var link = await db.InvitationLinks.FirstAsync(l => l.Token == token);
        link.UseCount.Should().Be(1);

        var enrollments = await db.Enrollments.CountAsync();
        enrollments.Should().Be(1);
    }

    [Fact]
    public async Task Handle_ThrowsInvitationNotFoundException_WhenTokenNotFound()
    {
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new JoinClassroomByTokenCommandHandler(db, accessor);
        var act = () => handler.Handle(new JoinClassroomByTokenCommand("nonexistent"), default);

        await act.Should().ThrowAsync<InvitationNotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsInvitationNotFoundException_WhenLinkIsInactive()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var token = Guid.NewGuid().ToString("N");
        db.AddInvitationLink(classroom.Id, token, isActive: false);

        var handler = new JoinClassroomByTokenCommandHandler(db, accessor);
        var act = () => handler.Handle(new JoinClassroomByTokenCommand(token), default);

        await act.Should().ThrowAsync<InvitationNotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsInvitationExpiredException_WhenLinkIsExpired()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var token = Guid.NewGuid().ToString("N");
        db.AddInvitationLink(classroom.Id, token, expiresAt: DateTime.UtcNow.AddMinutes(-1));

        var handler = new JoinClassroomByTokenCommandHandler(db, accessor);
        var act = () => handler.Handle(new JoinClassroomByTokenCommand(token), default);

        await act.Should().ThrowAsync<InvitationExpiredException>();
    }

    [Fact]
    public async Task Handle_ThrowsAlreadyClassroomTeacherException_WhenTeacherTriesToJoin()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var token = Guid.NewGuid().ToString("N");
        db.AddInvitationLink(classroom.Id, token);

        var handler = new JoinClassroomByTokenCommandHandler(db, accessor);
        var act = () => handler.Handle(new JoinClassroomByTokenCommand(token), default);

        await act.Should().ThrowAsync<AlreadyClassroomTeacherException>();
    }

    [Fact]
    public async Task Handle_ThrowsAlreadyEnrolledException_WhenAlreadyEnrolled()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        db.AddEnrollment(classroom.Id, studentId);
        var token = Guid.NewGuid().ToString("N");
        db.AddInvitationLink(classroom.Id, token);

        var handler = new JoinClassroomByTokenCommandHandler(db, accessor);
        var act = () => handler.Handle(new JoinClassroomByTokenCommand(token), default);

        await act.Should().ThrowAsync<AlreadyEnrolledException>();
    }

    [Fact]
    public async Task Handle_AcceptsLink_WhenExpiresAtIsNull()
    {
        var teacherId = Guid.NewGuid().ToString();
        var studentId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(studentId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(studentId, "student@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var token = Guid.NewGuid().ToString("N");
        db.AddInvitationLink(classroom.Id, token, expiresAt: null);

        var handler = new JoinClassroomByTokenCommandHandler(db, accessor);
        var result = await handler.Handle(new JoinClassroomByTokenCommand(token), default);

        result.Should().NotBeNull();
    }
}
