using System.Security.Claims;
using HackathonUnirios2026.Application.Features.VoiceCommands.Commands;
using HackathonUnirios2026.Application.Features.VoiceCommands.DTOs;
using MediatR;

namespace HackathonUnirios2026.API.Features.VoiceCommands;

public sealed class VoiceCommandEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/voice-commands", ProcessAsync)
            .WithTags("VoiceCommands")
            .WithName("ProcessVoiceCommand")
            .Produces<VoiceCommandResponse>()
            .RequireAuthorization();
    }

    private static async Task<IResult> ProcessAsync(
        VoiceCommandRequest request,
        ClaimsPrincipal user,
        ISender sender,
        CancellationToken ct)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var result = await sender.Send(new ProcessVoiceCommandCommand(request, userId), ct);
        return Results.Ok(result);
    }
}
