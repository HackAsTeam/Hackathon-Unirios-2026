using HackathonUnirios2026.Application.Features.Auth.Commands;
using HackathonUnirios2026.Application.Features.Auth.DTOs;
using HackathonUnirios2026.Domain.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HackathonUnirios2026.API.Features.Auth;

public sealed class AuthEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
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

        group.MapPut("/me/role", SetRoleAsync)
            .WithName("SetRole")
            .RequireAuthorization()
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);
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

    private static async Task<IResult> SetRoleAsync(
        SetRoleRequest request,
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        try
        {
            return Results.Ok(await sender.Send(new SetRoleCommand(userId, request.Role), ct));
        }
        catch (AuthValidationException ex)
        {
            return Results.BadRequest(new ErrorResponse(ex.Message));
        }
    }

    private sealed record SetRoleRequest(string Role);
    private sealed record ErrorResponse(string Message);
}
