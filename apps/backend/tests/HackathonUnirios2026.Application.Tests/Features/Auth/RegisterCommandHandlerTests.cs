using HackathonUnirios2026.Application.Features.Auth.Commands;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Tests.Features.Auth;

public class RegisterCommandHandlerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManager = UserManagerMockFactory.Create();
    private readonly Mock<IJwtTokenIssuer> _jwtIssuer = new();
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _jwtIssuer.Setup(j => j.CreateToken(It.IsAny<ApplicationUser>())).Returns("test-token");
        _handler = new RegisterCommandHandler(_userManager.Object, _jwtIssuer.Object);
    }

    [Fact]
    public async Task Handle_ReturnsAuthResponse_WithStudentRole_WhenRegistrationSucceeds()
    {
        _userManager.Setup(m => m.FindByEmailAsync("user@test.com")).ReturnsAsync((ApplicationUser?)null);
        _userManager.WithSuccessfulCreate();

        var result = await _handler.Handle(new RegisterCommand("user@test.com", "Password1!", "Alice"), default);

        result.Token.Should().Be("test-token");
        result.Email.Should().Be("user@test.com");
        result.Role.Should().Be("Student");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenEmailIsEmpty()
    {
        var act = () => _handler.Handle(new RegisterCommand("", "Password1!", null), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Email is required.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenPasswordIsEmpty()
    {
        var act = () => _handler.Handle(new RegisterCommand("user@test.com", "", null), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Password is required.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenEmailIsAlreadyRegistered()
    {
        var existing = new ApplicationUser { Email = "taken@test.com" };
        _userManager.Setup(m => m.FindByEmailAsync("taken@test.com")).ReturnsAsync(existing);

        var act = () => _handler.Handle(new RegisterCommand("taken@test.com", "Password1!", null), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Email is already registered.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenIdentityCreateFails()
    {
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser?)null);
        _userManager.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too weak." }));

        var act = () => _handler.Handle(new RegisterCommand("user@test.com", "weak", null), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("*Password too weak.*");
    }

    [Fact]
    public async Task Handle_SetsDisplayNameToNull_WhenWhitespaceProvided()
    {
        ApplicationUser? capturedUser = null;
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser?)null);
        _userManager.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<ApplicationUser, string>((u, _) =>
            {
                u.Id = Guid.NewGuid().ToString();
                capturedUser = u;
            });

        await _handler.Handle(new RegisterCommand("user@test.com", "Password1!", "   "), default);

        capturedUser!.DisplayName.Should().BeNull();
    }
}
