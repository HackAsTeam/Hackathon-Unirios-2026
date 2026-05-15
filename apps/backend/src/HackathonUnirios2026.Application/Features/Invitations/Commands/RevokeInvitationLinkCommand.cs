using MediatR;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public record RevokeInvitationLinkCommand(Guid LinkId) : IRequest;
