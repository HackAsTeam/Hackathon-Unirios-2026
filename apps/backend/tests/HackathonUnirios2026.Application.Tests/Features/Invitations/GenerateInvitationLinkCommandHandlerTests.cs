using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations.Commands;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HackathonUnirios2026.Application.Tests.Features.Invitations;

public class GenerateInvitationLinkCommandHandlerTests
{
    private static IConfiguration BuildConfig(string? baseUrl = null)
    {
        var dict = new Dictionary<string, string?>();
        if (baseUrl is not null)
            dict["App:BaseUrl"] = baseUrl;

        return new ConfigurationBuilder()
            .AddInMemoryCollection(dict)
            .Build();
    }

    [Fact]
    public async Task Handle_ReturnsInvitationLink_WhenTeacherGenerates()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);

        var handler = new GenerateInvitationLinkCommandHandler(db, accessor, BuildConfig("https://app.test"));
        var result = await handler.Handle(new GenerateInvitationLinkCommand(classroom.Id, null), default);

        result.ClassroomId.Should().Be(classroom.Id);
        result.IsActive.Should().BeTrue();
        result.UseCount.Should().Be(0);
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_BuildsInviteUrl_UsingConfiguredBaseUrl()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);

        var handler = new GenerateInvitationLinkCommandHandler(db, accessor, BuildConfig("https://app.test"));
        var result = await handler.Handle(new GenerateInvitationLinkCommand(classroom.Id, null), default);

        result.InviteUrl.Should().StartWith("https://app.test/i/");
    }

    [Fact]
    public async Task Handle_UsesDefaultBaseUrl_WhenConfigNotSet()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);

        var handler = new GenerateInvitationLinkCommandHandler(db, accessor, BuildConfig());
        var result = await handler.Handle(new GenerateInvitationLinkCommand(classroom.Id, null), default);

        result.InviteUrl.Should().StartWith("http://localhost:5099/i/");
    }

    [Fact]
    public async Task Handle_SetsExpiresAt_WhenProvided()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);
        var expiresAt = DateTime.UtcNow.AddDays(7);

        var handler = new GenerateInvitationLinkCommandHandler(db, accessor, BuildConfig("https://app.test"));
        var result = await handler.Handle(new GenerateInvitationLinkCommand(classroom.Id, expiresAt), default);

        result.ExpiresAt.Should().BeCloseTo(expiresAt, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task Handle_ThrowsNotTeacherException_WhenClassroomNotFound()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var handler = new GenerateInvitationLinkCommandHandler(db, accessor, BuildConfig());
        var act = () => handler.Handle(new GenerateInvitationLinkCommand(Guid.NewGuid(), null), default);

        await act.Should().ThrowAsync<NotTeacherException>();
    }

    [Fact]
    public async Task Handle_ThrowsNotTeacherException_WhenUserIsNotTeacher()
    {
        var teacherId = Guid.NewGuid().ToString();
        var notTeacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(notTeacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        db.AddUser(notTeacherId, "other@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);

        var handler = new GenerateInvitationLinkCommandHandler(db, accessor, BuildConfig());
        var act = () => handler.Handle(new GenerateInvitationLinkCommand(classroom.Id, null), default);

        await act.Should().ThrowAsync<NotTeacherException>();
    }

    [Fact]
    public async Task Handle_PersistsLink_InDatabase()
    {
        var teacherId = Guid.NewGuid().ToString();
        var accessor = ClaimsHelper.ForUser(teacherId);
        using var db = DbContextFactory.Create(accessor);

        var teacher = db.AddUser(teacherId, "teacher@test.com");
        var classroom = db.AddClassroom(teacherId, "Math", teacher);

        var handler = new GenerateInvitationLinkCommandHandler(db, accessor, BuildConfig());
        await handler.Handle(new GenerateInvitationLinkCommand(classroom.Id, null), default);

        var count = await db.InvitationLinks.CountAsync();
        count.Should().Be(1);
    }
}
