using HackathonUnirios2026.Application.Features.VoiceCommands.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.VoiceCommands.Commands;

public sealed record ProcessVoiceCommandCommand(VoiceCommandRequest Request, string UserId)
    : IRequest<VoiceCommandResponse>;
