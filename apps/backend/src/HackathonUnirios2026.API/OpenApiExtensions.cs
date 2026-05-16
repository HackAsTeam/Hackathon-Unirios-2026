using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

namespace HackathonUnirios2026.API;

public static class OpenApiExtensions
{
    private const string BearerSecurityScheme = JwtBearerDefaults.AuthenticationScheme;

    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
                document.Components.SecuritySchemes[BearerSecurityScheme] = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description = "Enter only the JWT. Scalar sends it as: Authorization: Bearer <token>.",
                };

                return Task.CompletedTask;
            });

            options.AddOperationTransformer((operation, context, _) =>
            {
                var endpointMetadata = context.Description.ActionDescriptor.EndpointMetadata;
                var requiresAuthorization = endpointMetadata.OfType<IAuthorizeData>().Any();
                var allowsAnonymous = endpointMetadata.OfType<IAllowAnonymous>().Any();

                if (!requiresAuthorization || allowsAnonymous)
                {
                    return Task.CompletedTask;
                }

                operation.Security ??= [];
                operation.Security.Add(new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference(BearerSecurityScheme, context.Document, externalResource: null)] = [],
                });

                return Task.CompletedTask;
            });
        });

        return services;
    }

    public static IEndpointRouteBuilder MapApiDocumentation(this IEndpointRouteBuilder app)
    {
        app.MapOpenApi();
        app.MapScalarApiReference(options => options
            .AddPreferredSecuritySchemes(BearerSecurityScheme)
            .AddHttpAuthentication(BearerSecurityScheme, _ => { })
            .EnablePersistentAuthentication());

        return app;
    }
}
