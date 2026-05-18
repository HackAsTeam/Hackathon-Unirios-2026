using HackathonUnirios2026.Domain.Entities;
using HackathonUnirios2026.Domain.Enums;
using HackathonUnirios2026.Infra.Database;

namespace HackathonUnirios2026.Application.Tests.Infrastructure;

public static class SeedBuilder
{
    public static ApplicationUser AddUser(this AppDbContext db,
        string? id = null,
        string email = "user@example.com",
        UserRole role = UserRole.Student,
        UserStatus status = UserStatus.Active)
    {
        var user = new ApplicationUser
        {
            Id = id ?? Guid.NewGuid().ToString(),
            UserName = email,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            NormalizedUserName = email.ToUpperInvariant(),
            Role = role,
            Status = status,
        };
        db.Users.Add(user);
        db.SaveChanges();
        return user;
    }

    public static Classroom AddClassroom(this AppDbContext db,
        string teacherId,
        string title = "Test Classroom",
        ApplicationUser? teacher = null)
    {
        var classroom = new Classroom
        {
            Id = Guid.NewGuid(),
            Title = title,
            TeacherId = teacherId,
            Teacher = teacher!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = teacherId,
        };
        db.Classrooms.Add(classroom);
        db.SaveChanges();
        return classroom;
    }

    public static Enrollment AddEnrollment(this AppDbContext db,
        Guid classroomId,
        string studentId)
    {
        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            ClassroomId = classroomId,
            StudentId = studentId,
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = studentId,
        };
        db.Enrollments.Add(enrollment);
        db.SaveChanges();
        return enrollment;
    }

    public static InvitationLink AddInvitationLink(this AppDbContext db,
        Guid classroomId,
        string? token = null,
        bool isActive = true,
        DateTime? expiresAt = null)
    {
        var link = new InvitationLink
        {
            Id = Guid.NewGuid(),
            Token = token ?? Guid.NewGuid().ToString("N"),
            ClassroomId = classroomId,
            IsActive = isActive,
            ExpiresAt = expiresAt,
            UseCount = 0,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        };
        db.InvitationLinks.Add(link);
        db.SaveChanges();
        return link;
    }

    public static (Exam exam, Subject subject) AddExamWithMcqQuestions(this AppDbContext db,
        Guid classroomId,
        string teacherId,
        int questionCount = 1)
    {
        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            ClassroomId = classroomId,
            Name = "Test Subject",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = teacherId,
        };
        db.Subjects.Add(subject);

        var questions = Enumerable.Range(1, questionCount).Select(i =>
        {
            var correctOptionId = Guid.NewGuid();
            var wrongOptionId = Guid.NewGuid();
            return new Question
            {
                Id = Guid.NewGuid(),
                OrderIndex = i,
                Text = $"Question {i}",
                Options =
                [
                    new QuestionOption { Id = correctOptionId, OrderIndex = 1, Text = "Correct", IsCorrect = true },
                    new QuestionOption { Id = wrongOptionId, OrderIndex = 2, Text = "Wrong", IsCorrect = false },
                ],
            };
        }).ToList();

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            ClassroomId = classroomId,
            SubjectId = subject.Id,
            Title = "Test Exam",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = teacherId,
            Questions = questions,
        };
        db.Exams.Add(exam);
        db.SaveChanges();
        return (exam, subject);
    }

    public static ExamAttempt AddAttempt(this AppDbContext db,
        Guid examId,
        string studentId,
        AttemptStatus status = AttemptStatus.InProgress)
    {
        var attempt = new ExamAttempt
        {
            Id = Guid.NewGuid(),
            ExamId = examId,
            StudentId = studentId,
            StartedAt = DateTime.UtcNow.AddMinutes(-5),
            Status = status,
            SubmittedAt = status != AttemptStatus.InProgress ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = studentId,
        };
        db.ExamAttempts.Add(attempt);
        db.SaveChanges();
        return attempt;
    }

    public static QuestionAnswer AddAnswer(this AppDbContext db,
        Guid attemptId,
        Guid questionId,
        Guid? selectedOptionId = null,
        decimal? score = null)
    {
        var answer = new QuestionAnswer
        {
            Id = Guid.NewGuid(),
            AttemptId = attemptId,
            QuestionId = questionId,
            SelectedOptionId = selectedOptionId,
            Score = score,
            AnsweredAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        };
        db.QuestionAnswers.Add(answer);
        db.SaveChanges();
        return answer;
    }
}
