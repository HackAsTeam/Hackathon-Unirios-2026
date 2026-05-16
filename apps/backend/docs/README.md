# Backend Endpoint Docs

- [Auth](Auth.md) — register, login, and Google OAuth endpoints
- POST /auth/register - create an account and return a JWT.
- POST /auth/login - authenticate with email and password.
- POST /auth/google - authenticate with Google OpenID Connect.
- [POST /classrooms](Classrooms/CreateClassroom.md) - create a classroom without requiring subjects.
- [GET /classrooms](Classrooms/GetMyClassrooms.md) - list classrooms where the user is teacher or enrolled student.
- [GET /classrooms/{id}](Classrooms/GetClassroomById.md) - get a classroom only when the user belongs to it.
- [POST /classrooms/{classroomId}/subjects](Subjects/CreateSubject.md) - create a subject inside a classroom.
- [GET /classrooms/{classroomId}/subjects](Subjects/GetSubjects.md) - list subjects in a classroom visible to the user.
- [Backend architecture corrections](BackendArchitectureCorrections.md) — endpoint registration and classroom role model notes.
