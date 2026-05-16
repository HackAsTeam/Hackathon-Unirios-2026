using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Invitations;
using HackathonUnirios2026.Application.Features.Invitations.Commands;
using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using MediatR;
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
            .Produces<InvitationLinkResponse>();

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
        GenerateInvitationLinkCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(command, ct);
            return Results.Ok(result);
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> JoinClassroomAsync(
        JoinClassroomByTokenCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(command, ct);
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
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            await sender.Send(new RevokeInvitationLinkCommand(id), ct);
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

    private static IResult OpenInviteLinkAsync(string token, IConfiguration config)
    {
        var scheme = config["App:MobileScheme"] ?? "hackathon-app";
        var deepLink = $"{scheme}://invite/{token}";
        var html = $$"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Entrar na sala</title>
              <meta http-equiv="refresh" content="0;url={{deepLink}}">
            </head>
            <body>
              <p>Abrindo o app... <a href="{{deepLink}}">Clique aqui</a> se não abrir automaticamente.</p>
              <script>window.location.href = "{{deepLink}}";</script>
            </body>
            </html>
            """;
        return Results.Content(html, "text/html");
    }
}
