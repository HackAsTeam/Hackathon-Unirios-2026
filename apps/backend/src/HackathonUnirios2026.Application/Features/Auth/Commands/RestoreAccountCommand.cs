using HackathonUnirios2026.Application.Features.Auth.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public record RestoreAccountCommand(string Email, string Password) : IRequest<AuthResponse>;
