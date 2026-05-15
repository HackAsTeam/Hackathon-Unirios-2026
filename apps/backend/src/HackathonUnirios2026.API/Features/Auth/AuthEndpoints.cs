using HackathonUnirios2026.Application.Features.Auth.Commands;
using HackathonUnirios2026.Application.Features.Auth.DTOs;
using HackathonUnirios2026.Domain.Auth;
using MediatR;

namespace HackathonUnirios2026.API.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth")
            .WithTags("Auth");

        group.MapPost("/register", RegisterAsync)
            .WithName("Register")
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest);

        group.MapPost("/login", LoginAsync)
            .WithName("Login")
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);

        group.MapPost("/google", GoogleLoginAsync)
            .WithName("GoogleLogin")
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);

        return app;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            return Results.Ok(await sender.Send(command, ct));
        }
        catch (AuthValidationException ex)
        {
            return Results.BadRequest(new ErrorResponse(ex.Message));
        }
    }

    private static async Task<IResult> LoginAsync(
        LoginCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            return Results.Ok(await sender.Send(command, ct));
        }
        catch (AuthValidationException ex)
        {
            return Results.BadRequest(new ErrorResponse(ex.Message));
        }
        catch (AuthUnauthorizedException ex)
        {
            return Results.Json(new ErrorResponse(ex.Message), statusCode: StatusCodes.Status401Unauthorized);
        }
    }

    private static async Task<IResult> GoogleLoginAsync(
        GoogleLoginCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            return Results.Ok(await sender.Send(command, ct));
        }
        catch (AuthValidationException ex)
        {
            return Results.BadRequest(new ErrorResponse(ex.Message));
        }
        catch (AuthUnauthorizedException ex)
        {
            return Results.Json(new ErrorResponse(ex.Message), statusCode: StatusCodes.Status401Unauthorized);
        }
    }

    private sealed record ErrorResponse(string Message);
}
