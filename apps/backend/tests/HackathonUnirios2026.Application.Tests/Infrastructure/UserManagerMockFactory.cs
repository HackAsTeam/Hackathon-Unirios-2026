using HackathonUnirios2026.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HackathonUnirios2026.Application.Tests.Infrastructure;

public static class UserManagerMockFactory
{
    public static Mock<UserManager<ApplicationUser>> Create()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        store.As<IUserPasswordStore<ApplicationUser>>();
        store.As<IUserEmailStore<ApplicationUser>>();
        store.As<IUserLockoutStore<ApplicationUser>>();
        store.As<IUserSecurityStampStore<ApplicationUser>>();

        var options = new Mock<IOptions<IdentityOptions>>();
        options.Setup(o => o.Value).Returns(new IdentityOptions());

        var passwordHasher = new Mock<IPasswordHasher<ApplicationUser>>();
        var userValidators = new List<IUserValidator<ApplicationUser>>();
        var passwordValidators = new List<IPasswordValidator<ApplicationUser>>();
        var keyNormalizer = new Mock<ILookupNormalizer>();
        var errors = new IdentityErrorDescriber();
        var services = new Mock<IServiceProvider>();
        var logger = new Mock<ILogger<UserManager<ApplicationUser>>>();

        var mock = new Mock<UserManager<ApplicationUser>>(
            store.Object,
            options.Object,
            passwordHasher.Object,
            userValidators,
            passwordValidators,
            keyNormalizer.Object,
            errors,
            services.Object,
            logger.Object);

        mock.Setup(m => m.AccessFailedAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);
        mock.Setup(m => m.ResetAccessFailedCountAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);
        mock.Setup(m => m.UpdateSecurityStampAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);

        return mock;
    }

    public static Mock<UserManager<ApplicationUser>> WithSuccessfulCreate(
        this Mock<UserManager<ApplicationUser>> mock)
    {
        mock.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<ApplicationUser, string>((user, _) => user.Id = Guid.NewGuid().ToString());
        return mock;
    }

    public static Mock<UserManager<ApplicationUser>> WithSuccessfulUpdate(
        this Mock<UserManager<ApplicationUser>> mock)
    {
        mock.Setup(m => m.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);
        return mock;
    }
}
