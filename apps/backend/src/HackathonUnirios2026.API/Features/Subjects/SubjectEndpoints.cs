using HackathonUnirios2026.Application.Features.Subjects.Commands;
using HackathonUnirios2026.Application.Features.Subjects.DTOs;
using HackathonUnirios2026.Application.Features.Subjects.Queries;
using MediatR;

namespace HackathonUnirios2026.API.Features.Subjects;

public static class SubjectEndpoints
{
    public static IEndpointRouteBuilder MapSubjectEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/subjects")
            .WithTags("Subjects")
            .RequireAuthorization();

        group.MapPost("/", CreateSubjectAsync)
            .WithName("CreateSubject")
            .Produces<SubjectResponse>(StatusCodes.Status200OK);

        group.MapGet("/", GetSubjectsAsync)
            .WithName("GetSubjects")
            .Produces<List<SubjectResponse>>();

        return app;
    }

    private static async Task<IResult> CreateSubjectAsync(
        CreateSubjectCommand command,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetSubjectsAsync(
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetSubjectsQuery(), ct);
        return Results.Ok(result);
    }
}
