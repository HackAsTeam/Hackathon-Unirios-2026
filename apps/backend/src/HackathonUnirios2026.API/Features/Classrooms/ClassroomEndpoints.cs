using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Classrooms.Commands;
using HackathonUnirios2026.Application.Features.Classrooms.DTOs;
using HackathonUnirios2026.Application.Features.Classrooms.Queries;
using MediatR;

namespace HackathonUnirios2026.API.Features.Classrooms;

public sealed class ClassroomEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/classrooms")
            .WithTags("Classrooms")
            .RequireAuthorization();

        group.MapPost("/", CreateClassroomAsync)
            .WithName("CreateClassroom")
            .Produces<ClassroomResponse>(StatusCodes.Status201Created);

        group.MapGet("/", GetMyClassroomsAsync)
            .WithName("GetMyClassrooms")
            .Produces<List<ClassroomResponse>>();

        group.MapGet("/{id:guid}", GetClassroomByIdAsync)
            .WithName("GetClassroomById")
            .Produces<ClassroomDetailResponse>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{id:guid}/members", GetClassroomMembersAsync)
            .WithName("GetClassroomMembers")
            .Produces<List<ClassroomMemberResponse>>()
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> CreateClassroomAsync(
        CreateClassroomRequest body,
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var teacherId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await sender.Send(new CreateClassroomCommand(body.Title, body.Description, teacherId), ct);
        return Results.Created($"/classrooms/{result.Id}", result);
    }

    private static async Task<IResult> GetMyClassroomsAsync(
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await sender.Send(new GetMyClassroomsQuery(userId), ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetClassroomByIdAsync(
        Guid id,
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var result = await sender.Send(new GetClassroomByIdQuery(id, userId), ct);
            return Results.Ok(result);
        }
        catch (ClassroomNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> GetClassroomMembersAsync(
        Guid id,
        ClaimsPrincipal principal,
        ISender sender,
        CancellationToken ct)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var result = await sender.Send(new GetClassroomMembersQuery(id, userId), ct);
            return Results.Ok(result);
        }
        catch (ClassroomNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
    }

    private sealed record CreateClassroomRequest(string Title, string? Description);
}
