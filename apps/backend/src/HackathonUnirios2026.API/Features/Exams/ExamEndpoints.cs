using System.Security.Claims;
using HackathonUnirios2026.Application.Features.Exams;
using HackathonUnirios2026.Application.Features.Exams.Commands;
using HackathonUnirios2026.Application.Features.Exams.DTOs;
using HackathonUnirios2026.Application.Features.Exams.Queries;
using HackathonUnirios2026.Application.Features.Classrooms;
using HackathonUnirios2026.Application.Features.Subjects;
using HackathonUnirios2026.Application.Features.ExamAttempts.DTOs;
using HackathonUnirios2026.Application.Features.ExamAttempts.Queries;
using MediatR;

namespace HackathonUnirios2026.API.Features.Exams;

public sealed class ExamEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/exams")
            .WithTags("Exams")
            .RequireAuthorization();

        var activitiesGroup = app.MapGroup("/activities")
            .WithTags("Activities")
            .RequireAuthorization();

        var subjectActivitiesGroup = app.MapGroup("/subjects/{subjectId:guid}/activities")
            .WithTags("Activities")
            .RequireAuthorization();

        group.MapPost("/", CreateExamAsync)
            .WithName("CreateExam")
            .Produces<ExamDetailResponse>()
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/assign", AssignExamAsync)
            .WithName("AssignExam")
            .Produces<ClassroomExamResponse>()
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{id:guid}", GetExamByIdAsync)
            .WithName("GetExamById")
            .Produces<ExamDetailResponse>()
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/classroom/{classroomId:guid}", GetClassroomExamsAsync)
            .WithName("GetClassroomExams")
            .Produces<List<ExamResponse>>();

        activitiesGroup.MapGet("/{id:guid}", GetExamByIdAsync)
            .WithName("GetActivityById")
            .Produces<ExamDetailResponse>()
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        subjectActivitiesGroup.MapPost("/", CreateSubjectActivityAsync)
            .WithName("CreateSubjectActivity")
            .Produces<ExamDetailResponse>()
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        subjectActivitiesGroup.MapGet("/", GetSubjectActivitiesAsync)
            .WithName("GetSubjectActivities")
            .Produces<List<ExamResponse>>()
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        activitiesGroup.MapGet("/my-status", GetStudentActivityStatusesAsync)
            .WithName("GetStudentActivityStatuses")
            .Produces<List<StudentActivityStatusResponse>>();

        activitiesGroup.MapGet("/{id:guid}/attempts", GetActivityAttemptsAsync)
            .WithName("GetActivityAttempts")
            .RequireAuthorization()
            .Produces<List<ActivityAttemptSummaryResponse>>()
            .Produces(StatusCodes.Status403Forbidden);
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
        catch (SubjectNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (InvalidExamException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
    }

    private static async Task<IResult> CreateSubjectActivityAsync(
        Guid subjectId,
        CreateSubjectActivityRequest body,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new CreateExamCommand(subjectId, body.Title, body.Description, body.Questions), ct);
            return Results.Ok(result);
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
        catch (SubjectNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (InvalidExamException ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
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
        catch (ClassroomNotFoundException)
        {
            return Results.Forbid();
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

    private static async Task<IResult> GetSubjectActivitiesAsync(
        Guid subjectId,
        ISender sender,
        CancellationToken ct)
    {
        try
        {
            var result = await sender.Send(new GetSubjectExamsQuery(subjectId), ct);
            return Results.Ok(result);
        }
        catch (SubjectNotFoundException ex)
        {
            return Results.NotFound(new { Message = ex.Message });
        }
        catch (ClassroomNotFoundException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> GetStudentActivityStatusesAsync(
        HttpContext httpContext,
        ISender sender,
        CancellationToken ct)
    {
        var studentId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await sender.Send(new GetStudentActivityStatusesQuery(studentId), ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetActivityAttemptsAsync(
        Guid id,
        HttpContext httpContext,
        ISender sender,
        CancellationToken ct)
    {
        var teacherId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var result = await sender.Send(new GetActivityAttemptsQuery(id, teacherId), ct);
            return Results.Ok(result);
        }
        catch (NotTeacherException)
        {
            return Results.Forbid();
        }
    }

    private sealed record CreateSubjectActivityRequest(string Title, string? Description, List<CreateQuestionDto> Questions);
}
