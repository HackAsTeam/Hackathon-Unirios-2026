using System.Text.Json;

namespace HackathonUnirios2026.Application.Features.VoiceCommands.DTOs;

public sealed record VoiceCommandResponse(
    string Type,
    string? Command,
    JsonElement? Payload,
    string Speak
);
