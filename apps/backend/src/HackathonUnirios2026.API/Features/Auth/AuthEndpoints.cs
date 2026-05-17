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
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<PendingDeletionResponse>(StatusCodes.Status403Forbidden);

        group.MapPost("/google", GoogleLoginAsync)
            .WithName("GoogleLogin")
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<PendingDeletionResponse>(StatusCodes.Status403Forbidden);

        group.MapPut("/me/role", SetRoleAsync)
            .WithName("SetRole")
            .RequireAuthorization()
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapDelete("/me", DeleteAccountAsync)
            .WithName("DeleteAccount")
            .RequireAuthorization()
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/me/restore", RestoreAccountAsync)
            .WithName("RestoreAccount")
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);

        group.MapPost("/me/restore/google", RestoreWithGoogleAsync)
            .WithName("RestoreWithGoogle")
            .Produces<AuthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);
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
        catch (AccountPendingDeletionException ex)
        {
            return Results.Json(
                new PendingDeletionResponse("ACCOUNT_PENDING_DELETION", ex.RestoreUntil),
                statusCode: StatusCodes.Status403Forbidden);
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
        catch (AccountPendingDeletionException ex)
        {
            return Results.Json(
                new PendingDeletionResponse("ACCOUNT_PENDING_DELETION", ex.RestoreUntil),
                statusCode: StatusCodes.Status403Forbidden);
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

    private static async Task<IResult> DeleteAccountAsync(
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
            await sender.Send(new DeleteAccountCommand(userId), ct);
            return Results.NoContent();
        }
        catch (AuthValidationException ex)
        {
            return Results.BadRequest(new ErrorResponse(ex.Message));
        }
        catch (AuthUnauthorizedException)
        {
            return Results.Unauthorized();
        }
    }

    private static async Task<IResult> RestoreAccountAsync(
        RestoreAccountRequest request,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            return Results.Ok(await sender.Send(new RestoreAccountCommand(request.Email, request.Password), ct));
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

    private static async Task<IResult> RestoreWithGoogleAsync(
        RestoreWithGoogleRequest request,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            return Results.Ok(await sender.Send(new RestoreWithGoogleCommand(request.IdToken), ct));
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

    private sealed record SetRoleRequest(string Role);
    private sealed record RestoreAccountRequest(string Email, string Password);
    private sealed record RestoreWithGoogleRequest(string IdToken);
    private sealed record ErrorResponse(string Message);
    private sealed record PendingDeletionResponse(string Error, DateTime RestoreUntil);
}
