using HackathonUnirios2026.Application.Features.Auth.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public record RegisterCommand(string Email, string Password, string? DisplayName) : IRequest<AuthResponse>;
