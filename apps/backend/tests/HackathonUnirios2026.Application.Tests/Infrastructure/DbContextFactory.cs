using HackathonUnirios2026.Infra.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HackathonUnirios2026.Application.Tests.Infrastructure;

public static class DbContextFactory
{
    public static AppDbContext Create(
        IHttpContextAccessor? httpContextAccessor = null,
        string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options, httpContextAccessor);
    }
}
