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
            .Produces<ClassroomResponse>();

        group.MapGet("/", GetMyClassroomsAsync)
            .WithName("GetMyClassrooms")
            .Produces<List<ClassroomResponse>>();

        group.MapGet("/{id:guid}", GetClassroomByIdAsync)
            .WithName("GetClassroomById")
            .Produces<ClassroomDetailResponse>()
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> CreateClassroomAsync(
        CreateClassroomCommand command,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetMyClassroomsAsync(
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetMyClassroomsQuery(), ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetClassroomByIdAsync(
        Guid id,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new GetClassroomByIdQuery(id), ct);
            return Results.Ok(result);
        }
        catch (ClassroomNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
    }
}
