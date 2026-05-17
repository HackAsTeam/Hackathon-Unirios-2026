using System.Text.Json;

namespace HackathonUnirios2026.Application.Features.VoiceCommands.DTOs;

public sealed record VoiceCommandRequest(
    string Transcript,
    string Screen,
    JsonElement? Context
);
