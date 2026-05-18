using HackathonUnirios2026.Application.Features.Auth.Commands;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace HackathonUnirios2026.Application.Tests.Features.Auth;

public class DeleteAccountCommandHandlerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManager = UserManagerMockFactory.Create();
    private readonly DeleteAccountCommandHandler _handler;

    public DeleteAccountCommandHandlerTests()
    {
        _handler = new DeleteAccountCommandHandler(_userManager.Object);
    }

    [Fact]
    public async Task Handle_SetsPendingDeletion_WhenUserIsActive()
    {
        ApplicationUser? updatedUser = null;
        var user = new ApplicationUser { Id = "uid", Status = UserStatus.Active };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);
        _userManager.Setup(m => m.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<ApplicationUser>(u => updatedUser = u);

        await _handler.Handle(new DeleteAccountCommand("uid"), default);

        updatedUser!.Status.Should().Be(UserStatus.PendingDeletion);
        updatedUser.DeletedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        updatedUser.PurgeAfter.Should().BeCloseTo(DateTime.UtcNow.AddDays(30), TimeSpan.FromSeconds(5));
        updatedUser.SecurityStamp.Should().NotBeNullOrEmpty();
        _userManager.Verify(m => m.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_IsIdempotent_WhenUserIsAlreadyPendingDeletion()
    {
        var user = new ApplicationUser { Id = "uid", Status = UserStatus.PendingDeletion };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);

        await _handler.Handle(new DeleteAccountCommand("uid"), default);

        _userManager.Verify(m => m.UpdateAsync(It.IsAny<ApplicationUser>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ThrowsAuthUnauthorizedException_WhenUserNotFound()
    {
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync((ApplicationUser?)null);

        var act = () => _handler.Handle(new DeleteAccountCommand("uid"), default);

        await act.Should().ThrowAsync<AuthUnauthorizedException>();
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenUserIsAnonymized()
    {
        var user = new ApplicationUser { Id = "uid", Status = UserStatus.Anonymized };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);

        var act = () => _handler.Handle(new DeleteAccountCommand("uid"), default);

        await act.Should().ThrowAsync<AuthValidationException>()
            .WithMessage("Account has already been deleted.");
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenUserIsPurged()
    {
        var user = new ApplicationUser { Id = "uid", Status = UserStatus.Purged };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);

        var act = () => _handler.Handle(new DeleteAccountCommand("uid"), default);

        await act.Should().ThrowAsync<AuthValidationException>();
    }

    [Fact]
    public async Task Handle_ThrowsAuthValidationException_WhenUpdateAsyncFails()
    {
        var user = new ApplicationUser { Id = "uid", Status = UserStatus.Active };
        _userManager.Setup(m => m.FindByIdAsync("uid")).ReturnsAsync(user);
        _userManager.Setup(m => m.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "DB error." }));

        var act = () => _handler.Handle(new DeleteAccountCommand("uid"), default);

        await act.Should().ThrowAsync<AuthValidationException>();
    }
}
