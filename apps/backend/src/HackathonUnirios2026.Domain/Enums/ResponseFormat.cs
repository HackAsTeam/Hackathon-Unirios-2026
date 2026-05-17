using System.Text.Json.Serialization;

namespace HackathonUnirios2026.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResponseFormat { Text, Audio, Oral, Video }
