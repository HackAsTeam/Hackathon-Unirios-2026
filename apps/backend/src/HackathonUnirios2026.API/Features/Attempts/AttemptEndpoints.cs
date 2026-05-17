using HackathonUnirios2026.Application.Features.ExamAttempts;
using HackathonUnirios2026.Application.Features.ExamAttempts.Commands;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Application.Features.ExamAttempts.Queries;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Domain.Enums;
using MediatR;

namespace HackathonUnirios2026.API.Features.Attempts;

public sealed class AttemptEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/attempts")
            .WithTags("ExamAttempts")
            .RequireAuthorization();

        group.MapPost("/", StartAttemptAsync)
            .WithName("StartExamAttempt")
            .Produces<AttemptResponse>()
            .Produces(StatusCodes.Status403Forbidden);

        group.MapPost("/{attemptId:guid}/answers", SaveAnswerAsync)
            .WithName("SaveAnswer")
            .Produces<QuestionAnswerResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/{attemptId:guid}/submit-answers", SubmitAnswersAsync)
            .WithName("SubmitAttemptAnswers")
            .Produces<SubmitAnswersResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/{attemptId:guid}/submit", SubmitAttemptAsync)
            .WithName("SubmitExamAttempt")
            .Produces<AttemptResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/", GetMyAttemptsAsync)
            .WithName("GetMyAttempts")
            .Produces<List<AttemptResponse>>();

        group.MapPost("/{attemptId:guid}/answers/{answerId:guid}/grade", GradeAnswerAsync)
            .WithName("GradeAnswer")
            .Produces<QuestionAnswerResponse>()
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> StartAttemptAsync(
        StartExamAttemptCommand command,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(command, ct);
            return Results.Ok(result);
        }
        catch (NotEnrolledException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> SubmitAnswersAsync(
        Guid attemptId,
        SubmitAnswersRequest body,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new SubmitAttemptAnswersCommand(
                attemptId,
                body.Answers.Select(a => new SubmitAttemptAnswerDto(a.QuestionId, a.SelectedOptionId)).ToList()), ct);
            return Results.Ok(result);
        }
        catch (AttemptNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (AttemptNotInProgressException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
        catch (InvalidAttemptAnswersException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> SaveAnswerAsync(
        Guid attemptId,
        SaveAnswerRequest body,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new SaveAnswerCommand(attemptId, body.QuestionId, body.AnswerText, body.Format), ct);
            return Results.Ok(result);
        }
        catch (AttemptNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (AttemptNotInProgressException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> SubmitAttemptAsync(
        Guid attemptId,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new SubmitExamAttemptCommand(attemptId), ct);
            return Results.Ok(result);
        }
        catch (AttemptNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (AttemptNotInProgressException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> GetMyAttemptsAsync(
        Guid? examId,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetMyAttemptsQuery(examId), ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GradeAnswerAsync(
        Guid attemptId,
        Guid answerId,
        GradeAnswerRequest body,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new GradeAnswerCommand(attemptId, answerId, body.Score, body.Feedback), ct);
            return Results.Ok(result);
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
        catch (AttemptNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
    }

    private sealed record SaveAnswerRequest(Guid QuestionId, string AnswerText, ResponseFormat? Format);
    private sealed record SubmitAnswersRequest(List<SubmitAnswerRequest> Answers);
    private sealed record SubmitAnswerRequest(Guid QuestionId, Guid SelectedOptionId);
    private sealed record GradeAnswerRequest(decimal Score, string? Feedback);
}
