using System.Net;
using System.Security.Claims;
using System.Text.Json;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations;
using HackathonUnirios2026.Application.Features.Invitations.Commands;
using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using HackathonUnirios2026.Infra.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HackathonUnirios2026.API.Features.Invitations;

public sealed class InvitationEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/i/{token}", OpenInviteLinkAsync)
            .WithName("OpenInviteDeepLink")
            .WithTags("Invitations")
            .AllowAnonymous();

        var group = app.MapGroup("/invitations")
            .WithTags("Invitations")
            .RequireAuthorization();

        group.MapPost("/", GenerateInvitationAsync)
            .WithName("GenerateInvitation")
            .Produces<InvitationLinkResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/join", JoinClassroomAsync)
            .WithName("JoinClassroom")
            .Produces<EnrollmentResponse>()
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", RevokeInvitationAsync)
            .WithName("RevokeInvitation")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GenerateInvitationAsync(
        GenerateInvitationRequest body,
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var teacherId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var result = await sender.Send(new GenerateInvitationLinkCommand(body.ClassroomId, body.ExpiresAt, teacherId), ct);
            return Results.Created($"/invitations/{result.Id}", result);
        }
        catch (ClassroomNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> JoinClassroomAsync(
        JoinClassroomRequest body,
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var studentId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var result = await sender.Send(new JoinClassroomByTokenCommand(body.Token, studentId), ct);
            return Results.Ok(result);
        }
        catch (InvitationNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (InvitationExpiredException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
        catch (AlreadyEnrolledException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
        catch (AlreadyClassroomTeacherException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> RevokeInvitationAsync(
        Guid id,
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var teacherId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            await sender.Send(new RevokeInvitationLinkCommand(id, teacherId), ct);
            return Results.NoContent();
        }
        catch (InvitationNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> OpenInviteLinkAsync(
        string token,
        IConfiguration config,
        AppDbContext db,
        CancellationToken ct)
    {
        if (!IsTokenFormatValid(token))
            return Results.BadRequest();

        var exists = await db.InvitationLinks.AnyAsync(l => l.Token == token && l.IsActive, ct);
        if (!exists)
            return Results.NotFound();

        var scheme = config["App:MobileScheme"] ?? "hackathon-app";
        var deepLink = $"{scheme}://invite/{Uri.EscapeDataString(token)}";
        var htmlEncoded = WebUtility.HtmlEncode(deepLink);
        var jsLiteral = JsonSerializer.Serialize(deepLink);

        var html = $"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Entrar na sala</title>
              <meta http-equiv="refresh" content="0;url={htmlEncoded}">
            </head>
            <body>
              <p>Abrindo o app... <a href="{htmlEncoded}">Clique aqui</a> se não abrir automaticamente.</p>
              <script>window.location.href = {jsLiteral};</script>
            </body>
            </html>
            """;
        return Results.Content(html, "text/html");
    }

    private static bool IsTokenFormatValid(string token) =>
        !string.IsNullOrEmpty(token) && token.All(c => char.IsAsciiLetterOrDigit(c) || c == '-' || c == '_');

    private sealed record GenerateInvitationRequest(Guid ClassroomId, DateTime? ExpiresAt);
    private sealed record JoinClassroomRequest(string Token);
}
