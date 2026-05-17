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
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new ProcessVoiceCommandCommand(request), ct);
        return Results.Ok(result);
    }
}
