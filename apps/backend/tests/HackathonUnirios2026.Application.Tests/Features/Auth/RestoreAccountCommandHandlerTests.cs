using HackathonUnirios2026.Application.Features.Auth.Commands;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Tests.Features.Auth;

public class RestoreAccountCommandHandlerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManager = UserManagerMockFactory.Create();
    private readonly Mock<IJwtTokenIssuer> _jwtIssuer = new();
    private readonly RestoreAccountCommandHandler _handler;

    public RestoreAccountCommandHandlerTests()
    {
        _jwtIssuer.Setup(j => j.CreateToken(It.IsAny<ApplicationUser>())).Returns("test-token");
        _handler = new RestoreAccountCommandHandler(_userManager.Object, _jwtIssuer.Object);
    }

    private static ApplicationUser PendingDeletionUser(string email = "user@test.com") => new()
    {
        Id = Guid.NewGuid().ToString(),
        Email = email,
        UserName = email,
        Status = UserStatus.PendingDeletion,
        DeletedAt = DateTime.UtcNow.AddDays(-5),
        PurgeAfter = DateTime.UtcNow.AddDays(25),
    };

    [Fact]
    public async Task Handle_ReturnsAuthResponse_WhenRestoreSucceeds()
    {
        var user = PendingDeletionUser();
        _userManager.Setup(m => m.FindByEmailAsync(user.Email!)).ReturnsAsync(user);
        _userManager.Setup(m => m.CheckPasswordAsync(user, "password")).ReturnsAsync(true);
        _userManager.WithSuccessfulUpdate();

        var result = await _handler.Handle(new RestoreAccountCommand(user.Email!, "password"), default);

        user.Status.Should().Be(UserStatus.Active);
        user.DeletedAt.Should().BeNull();
        user.PurgeAfter.Should().BeNull();
        result.Token.Should().Be("test-token");
    }

    [Fact]
    public async Task Handle_ThrowsAuthUnauthorizedException_WhenUserNotFound()
    {
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser?)null);

        var act = () => _handler.Handle(new RestoreAccountCommand("notfound@test.com", "pass"), default);

        await act.Should().ThrowAsync<AuthUnauthorizedException>()
            .WithMessage("Invalid credentials.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthUnauthorizedException_WhenPasswordIsWrong()
    {
        var user = PendingDeletionUser();
        _userManager.Setup(m => m.FindByEmailAsync(user.Email!)).ReturnsAsync(user);
        _userManager.Setup(m => m.CheckPasswordAsync(user, "wrong")).ReturnsAsync(false);

        var act = () => _handler.Handle(new RestoreAccountCommand(user.Email!, "wrong"), default);

        await act.Should().ThrowAsync<AuthUnauthorizedException>()
            .WithMessage("Invalid credentials.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenStatusIsNotPendingDeletion()
    {
        var user = new ApplicationUser { Email = "user@test.com", Status = UserStatus.Active };
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _userManager.Setup(m => m.CheckPasswordAsync(user, "pass")).ReturnsAsync(true);

        var act = () => _handler.Handle(new RestoreAccountCommand("user@test.com", "pass"), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Account is not scheduled for deletion.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenGracePeriodHasElapsed()
    {
        var user = new ApplicationUser
        {
            Email = "user@test.com",
            Status = UserStatus.PendingDeletion,
            PurgeAfter = DateTime.UtcNow.AddDays(-1),
        };
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _userManager.Setup(m => m.CheckPasswordAsync(user, "pass")).ReturnsAsync(true);

        var act = () => _handler.Handle(new RestoreAccountCommand("user@test.com", "pass"), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Recovery period has expired*");
    }
}
