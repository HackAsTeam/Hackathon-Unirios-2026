using MediatR;

namespace HackathonUnirios2026.Application.Features.Auth.Commands;

public record DeleteAccountCommand(string UserId) : IRequest;
