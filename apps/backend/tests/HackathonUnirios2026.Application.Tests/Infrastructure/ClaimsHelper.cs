using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace HackathonUnirios2026.Application.Tests.Infrastructure;

public static class ClaimsHelper
{
    public static IHttpContextAccessor ForUser(string userId)
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };

        var accessor = new Mock<IHttpContextAccessor>();
        accessor.Setup(x => x.HttpContext).Returns(httpContext);
        return accessor.Object;
    }
}
