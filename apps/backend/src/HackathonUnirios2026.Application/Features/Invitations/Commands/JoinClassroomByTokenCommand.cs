using HackathonUnirios2026.Application.Features.Invitations.DTOs;
using MediatR;

namespace HackathonUnirios2026.Application.Features.Invitations.Commands;

public record JoinClassroomByTokenCommand(string Token, string StudentId) : IRequest<EnrollmentResponse>;
