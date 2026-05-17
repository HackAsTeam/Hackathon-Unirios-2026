using System.Text.Json;
using HackathonUnirios2026.Application.Features.VoiceCommands.DTOs;
using HackathonUnirios2026.Domain.AI;
using MediatR;

namespace HackathonUnirios2026.Application.Features.VoiceCommands.Commands;

public sealed class ProcessVoiceCommandCommandHandler(IGeminiClient geminiClient)
    : IRequestHandler<ProcessVoiceCommandCommand, VoiceCommandResponse>
{
    public async Task<VoiceCommandResponse> Handle(ProcessVoiceCommandCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;

        if (string.IsNullOrWhiteSpace(req.Transcript))
            return new VoiceCommandResponse("UNKNOWN", null, null, "Não ouvi nada. Pode repetir?");

        var contextJson = req.Context.HasValue
            ? req.Context.Value.ValueKind != JsonValueKind.Null ? req.Context.Value.GetRawText() : null
            : null;

        var result = await geminiClient.ProcessVoiceCommandAsync(
            req.Transcript,
            req.Screen,
            contextJson,
            ct);

        var type = result.Action == "UNKNOWN" ? "UNKNOWN" : "COMMAND";

        return new VoiceCommandResponse(type, result.Action, result.Parameters, result.SpokenFeedback);
    }
}
