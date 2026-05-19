using HackathonUnirios2026.Domain.AI;
using HackathonUnirios2026.Domain.Auth;
using HackathonUnirios2026.Infra.AI;
using HackathonUnirios2026.Infra.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HackathonUnirios2026.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.SectionName));
        services.Configure<GeminiOptions>(configuration.GetSection(GeminiOptions.SectionName));
        services.Configure<GroqOptions>(configuration.GetSection(GroqOptions.SectionName));

        services.AddSingleton<IJwtTokenIssuer, JwtTokenIssuer>();
        services.AddSingleton<IGoogleTokenValidator, GoogleTokenValidator>();

        services.AddHttpClient("gemini");
        services.AddHttpClient("groq");

        services.AddScoped<GeminiClient>();
        services.AddScoped<GroqClient>();
        services.AddScoped<IGeminiClient, FallbackAIClient>();

        return services;
    }
}
