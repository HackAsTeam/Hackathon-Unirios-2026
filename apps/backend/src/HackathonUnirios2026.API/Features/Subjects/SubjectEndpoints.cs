using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Subjects.Commands;
using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Application.Features.Subjects.Queries;
using MediatR;

namespace HackathonUnirios2026.API.Features.Subjects;

public sealed class SubjectEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/classrooms/{classroomId:guid}/subjects")
            .WithTags("Subjects")
            .RequireAuthorization();

        group.MapPost("/", CreateSubjectAsync)
            .WithName("CreateSubject")
            .Produces<SubjectResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/", GetSubjectsAsync)
            .WithName("GetSubjects")
            .Produces<List<SubjectResponse>>()
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> CreateSubjectAsync(
        Guid classroomId,
        CreateSubjectRequest body,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new CreateSubjectCommand(classroomId, body.Name, body.Description), ct);
            return Results.Ok(result);
        }
        catch (ClassroomNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> GetSubjectsAsync(
        Guid classroomId,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new GetSubjectsQuery(classroomId), ct);
            return Results.Ok(result);
        }
        catch (ClassroomNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
    }

    private sealed record CreateSubjectRequest(string Name, string? Description);
}
