using HackathonUnirios2026.Application.Features.Auth.Commands;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Tests.Features.Auth;

public class SetRoleCommandHandlerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManager = UserManagerMockFactory.Create();
    private readonly Mock<IJwtTokenIssuer> _jwtIssuer = new();
    private readonly SetRoleCommandHandler _handler;

    public SetRoleCommandHandlerTests()
    {
        _jwtIssuer.Setup(j => j.CreateToken(It.IsAny<ApplicationUser>())).Returns("test-token");
        _handler = new SetRoleCommandHandler(_userManager.Object, _jwtIssuer.Object);
    }

    [Fact]
    public async Task Handle_ReturnsAuthResponse_WithTeacherRole_WhenRoleIsTeacher()
    {
        var user = new ApplicationUser { Id = "uid", Email = "user@test.com", Role = UserRole.Student };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);
        _userManager.WithSuccessfulUpdate();

        var result = await _handler.Handle(new SetRoleCommand("uid", "Teacher"), default);

        result.Role.Should().Be("Teacher");
        user.Role.Should().Be(UserRole.Teacher);
    }

    [Fact]
    public async Task Handle_ParsesRole_CaseInsensitively()
    {
        var user = new ApplicationUser { Id = "uid", Email = "user@test.com" };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);
        _userManager.WithSuccessfulUpdate();

        var result = await _handler.Handle(new SetRoleCommand("uid", "teacher"), default);

        result.Role.Should().Be("Teacher");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenUserNotFound()
    {
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync((ApplicationUser?)null);

        var act = () => _handler.Handle(new SetRoleCommand("uid", "Teacher"), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("User not found.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenRoleIsInvalid()
    {
        var user = new ApplicationUser { Id = "uid" };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);

        var act = () => _handler.Handle(new SetRoleCommand("uid", "Admin"), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Invalid role*");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenUpdateFails()
    {
        var user = new ApplicationUser { Id = "uid", Email = "user@test.com" };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);
        _userManager.Setup(m => m.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Update failed." }));

        var act = () => _handler.Handle(new SetRoleCommand("uid", "Teacher"), default);

        await act.Should().ThrowAsync<AuthValidationException>();
    }
}
