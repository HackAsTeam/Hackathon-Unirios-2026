using HackathonUnirios2026.API;
using HackathonUnirios2026.Application;
using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Infra;
using HackathonUnirios2026.Infra.Auth;
using HackathonUnirios2026.Infra.Database;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiDocumentation();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ApplicationAssemblyMarker).Assembly));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();
builder.Services.AddInfrastructureServices(builder.Configuration);

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var jwtSigningKey = ResolveJwtSigningKey(jwtOptions, builder.Environment);
builder.Services.PostConfigure<JwtOptions>(options => options.SigningKey = jwtSigningKey);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            ValidateIssuer = !string.IsNullOrWhiteSpace(jwtOptions.Issuer),
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = !string.IsNullOrWhiteSpace(jwtOptions.Audience),
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpoints(typeof(Program).Assembly);
builder.Services.AddCors(options =>
{
    options.AddPolicy("Expo", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        if (origins.Length > 0)
        {
            policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
            return;
        }

        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            return;
        }

        throw new InvalidOperationException("Cors:AllowedOrigins must be configured outside development.");
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapApiDocumentation();
}

app.UseHttpsRedirection();
app.UseCors("Expo");
app.UseAuthentication();
app.UseAuthorization();

app.MapEndpoints();

app.Run();

static string ResolveJwtSigningKey(JwtOptions options, IWebHostEnvironment environment)
{
    const string PlaceholderJwtSigningKey = "development-only-change-this-signing-key-before-production";
    var signingKey = options.SigningKey;
    if (string.IsNullOrWhiteSpace(signingKey) || signingKey == PlaceholderJwtSigningKey)
    {
        var configurationSource = environment.IsDevelopment()
            ? "user-secrets, environment variables, or appsettings.Development.json"
            : "environment variables or a production secret provider";

        throw new InvalidOperationException($"Jwt:SigningKey must be configured through {configurationSource}.");
    }

    if (Encoding.UTF8.GetByteCount(signingKey) < 32)
    {
        throw new InvalidOperationException("Jwt:SigningKey must be at least 32 bytes.");
    }

    return signingKey;
}
