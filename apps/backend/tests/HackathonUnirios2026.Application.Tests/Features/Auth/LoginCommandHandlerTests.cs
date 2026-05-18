using HackathonUnirios2026.Application.Features.Auth.Commands;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Tests.Features.Auth;

public class LoginCommandHandlerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManager = UserManagerMockFactory.Create();
    private readonly Mock<IJwtTokenIssuer> _jwtIssuer = new();
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _jwtIssuer.Setup(j => j.CreateToken(It.IsAny<ApplicationUser>())).Returns("test-token");
        _handler = new LoginCommandHandler(_userManager.Object, _jwtIssuer.Object);
    }

    private static ApplicationUser ActiveUser(string email = "user@test.com") => new()
    {
        Id = Guid.NewGuid().ToString(),
        Email = email,
        UserName = email,
        Status = UserStatus.Active,
    };

    [Fact]
    public async Task Handle_ReturnsAuthResponse_WhenCredentialsAreValid()
    {
        var user = ActiveUser();
        _userManager.Setup(m => m.FindByEmailAsync(user.Email!)).ReturnsAsync(user);
        _userManager.Setup(m => m.IsLockedOutAsync(user)).ReturnsAsync(false);
        _userManager.Setup(m => m.CheckPasswordAsync(user, "password")).ReturnsAsync(true);

        var result = await _handler.Handle(new LoginCommand(user.Email!, "password"), default);

        result.Token.Should().Be("test-token");
        result.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenEmailIsEmpty()
    {
        var act = () => _handler.Handle(new LoginCommand("", "password"), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Email is required.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenPasswordIsEmpty()
    {
        var act = () => _handler.Handle(new LoginCommand("user@test.com", ""), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Password is required.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthUnauthorizedException_WhenUserNotFound()
    {
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser?)null);

        var act = () => _handler.Handle(new LoginCommand("notfound@test.com", "pass"), default);

        await act.Should().ThrowAsync<AuthUnauthorizedException>();
    }

    [Fact]
    public async Task Handle_ThrowsAccountPendingDeletionException_WhenStatusIsPendingDeletion()
    {
        var purgeAfter = DateTime.UtcNow.AddDays(25);
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = "user@test.com",
            Status = UserStatus.PendingDeletion,
            PurgeAfter = purgeAfter,
        };
        _userManager.Setup(m => m.FindByEmailAsync(user.Email!)).ReturnsAsync(user);

        var act = () => _handler.Handle(new LoginCommand(user.Email!, "pass"), default);

        var ex = await act.Should().ThrowAsync<AccountPendingDeletionException>();
        ex.Which.RestoreUntil.Should().BeCloseTo(purgeAfter, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task Handle_ThrowsAuthUnauthorizedException_WhenUserIsAnonymized()
    {
        var user = new ApplicationUser { Email = "a@a.com", Status = UserStatus.Anonymized };
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);

        var act = () => _handler.Handle(new LoginCommand("a@a.com", "pass"), default);

        await act.Should().ThrowAsync<AuthUnauthorizedException>();
    }

    [Fact]
    public async Task Handle_ThrowsAuthUnauthorizedException_WhenUserIsLockedOut()
    {
        var user = ActiveUser();
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _userManager.Setup(m => m.IsLockedOutAsync(user)).ReturnsAsync(true);

        var act = () => _handler.Handle(new LoginCommand(user.Email!, "pass"), default);

        await act.Should().ThrowAsync<AuthUnauthorizedException>();
    }

    [Fact]
    public async Task Handle_ThrowsAuthUnauthorizedException_WhenPasswordIsWrong()
    {
        var user = ActiveUser();
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _userManager.Setup(m => m.IsLockedOutAsync(user)).ReturnsAsync(false);
        _userManager.Setup(m => m.CheckPasswordAsync(user, "wrong")).ReturnsAsync(false);

        var act = () => _handler.Handle(new LoginCommand(user.Email!, "wrong"), default);

        await act.Should().ThrowAsync<AuthUnauthorizedException>();
        _userManager.Verify(m => m.AccessFailedAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_ResetsAccessFailedCount_WhenLoginSucceeds()
    {
        var user = ActiveUser();
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _userManager.Setup(m => m.IsLockedOutAsync(user)).ReturnsAsync(false);
        _userManager.Setup(m => m.CheckPasswordAsync(user, "pass")).ReturnsAsync(true);

        await _handler.Handle(new LoginCommand(user.Email!, "pass"), default);

        _userManager.Verify(m => m.ResetAccessFailedCountAsync(user), Times.Once);
    }
}
