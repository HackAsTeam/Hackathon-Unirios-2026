using HackathonUnirios2026.Application.Features.Exams;
using HackathonUnirios2026.Application.Features.Exams.Commands;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Exams.Queries;
using HackathonUnirios2026.Application.Features.Invitations;
using MediatR;

namespace HackathonUnirios2026.API.Features.Exams;

public sealed class ExamEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/exams")
            .WithTags("Exams")
            .RequireAuthorization();

        group.MapPost("/", CreateExamAsync)
            .WithName("CreateExam")
            .Produces<ExamDetailResponse>()
            .Produces(StatusCodes.Status403Forbidden);

        group.MapPost("/assign", AssignExamAsync)
            .WithName("AssignExam")
            .Produces<ClassroomExamResponse>()
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{id:guid}", GetExamByIdAsync)
            .WithName("GetExamById")
            .Produces<ExamDetailResponse>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/classroom/{classroomId:guid}", GetClassroomExamsAsync)
            .WithName("GetClassroomExams")
            .Produces<List<ExamResponse>>();
    }

    private static async Task<IResult> CreateExamAsync(
        CreateExamCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(command, ct);
            return Results.Ok(result);
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> AssignExamAsync(
        AssignExamToClassroomCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(command, ct);
            return Results.Ok(result);
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
        catch (ExamNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> GetExamByIdAsync(
        Guid id,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new GetExamByIdQuery(id), ct);
            return Results.Ok(result);
        }
        catch (ExamNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> GetClassroomExamsAsync(
        Guid classroomId,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetClassroomExamsQuery(classroomId), ct);
        return Results.Ok(result);
    }
}
