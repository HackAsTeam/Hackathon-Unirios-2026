# Backend Endpoint Docs

## Auth
- [Auth](Auth.md) — register, login, and Google OAuth endpoints

## Classrooms
- [POST /classrooms](Classrooms/CreateClassroom.md) — create a classroom
- [GET /classrooms](Classrooms/GetMyClassrooms.md) — list classrooms where the user is teacher or enrolled student
- [GET /classrooms/{id}](Classrooms/GetClassroomById.md) — get a classroom the user belongs to

## Subjects
- [POST /classrooms/{classroomId}/subjects](Subjects/CreateSubject.md) — create a subject inside a classroom (teacher only)
- [GET /classrooms/{classroomId}/subjects](Subjects/GetSubjects.md) — list subjects in a classroom

## Invitations
- [GET /i/{token}](Invitations/GenerateInvitation.md) — deep-link redirect for invitation tokens (anonymous)
- [POST /invitations](Invitations/GenerateInvitation.md) — generate an invitation token for a classroom (teacher only)
- [POST /invitations/join](Invitations/JoinClassroom.md) — join a classroom using an invitation token
- [DELETE /invitations/{id}](Invitations/RevokeInvitation.md) — revoke an invitation link (teacher only)

## Exams
- [POST /exams](Exams/CreateExam.md) — create an exam with questions (teacher only)
- [POST /exams/assign](Exams/AssignExam.md) — assign an exam to a classroom with an optional due date (teacher only)
- [GET /exams/{id}](Exams/GetExamById.md) — get full exam detail including questions
- [GET /exams/classroom/{classroomId}](Exams/GetClassroomExams.md) — list exams assigned to a classroom

## Activities (Subject-scoped Exams)
- [POST /subjects/{subjectId}/activities](Activities/CreateSubjectActivity.md) — create an activity tied to a subject (teacher only)
- [GET /subjects/{subjectId}/activities](Activities/GetSubjectActivities.md) — list activities for a subject
- [GET /activities/{id}](Activities/GetActivityById.md) — get activity detail including questions

## Exam Attempts
- [POST /attempts](Attempts/StartExamAttempt.md) — start an exam attempt (enrolled students only)
- [POST /attempts/{attemptId}/answers](Attempts/SaveAnswer.md) — save or overwrite a single answer within an in-progress attempt
- [POST /attempts/{attemptId}/submit-answers](Attempts/SubmitAnswers.md) — submit all multiple-choice answers at once with automatic scoring
- [POST /attempts/{attemptId}/submit](Attempts/SubmitAttempt.md) — finalize and submit a finished attempt
- [GET /attempts](Attempts/GetMyAttempts.md) — list the authenticated student's attempts, optionally filtered by exam
- [POST /attempts/{attemptId}/answers/{answerId}/grade](Attempts/GradeAnswer.md) — grade a student answer (teacher only)
