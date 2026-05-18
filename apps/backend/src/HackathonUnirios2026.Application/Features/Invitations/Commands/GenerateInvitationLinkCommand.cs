using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public record GenerateInvitationLinkCommand(Guid ClassroomId, DateTime? ExpiresAt, string TeacherId) : IRequest<InvitationLinkResponse>;
