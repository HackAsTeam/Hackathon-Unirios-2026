# Backend Endpoint Docs

- [Auth](Auth.md) — register, login, and Google OAuth endpoints
- [POST /classrooms](Classrooms/CreateClassroom.md) - create a classroom without requiring subjects.
- [GET /classrooms](Classrooms/GetMyClassrooms.md) - list classrooms where the user is teacher or enrolled student.
- [GET /classrooms/{id}](Classrooms/GetClassroomById.md) - get a classroom only when the user belongs to it.
- [POST /classrooms/{classroomId}/subjects](Subjects/CreateSubject.md) - create a subject inside a classroom.
- [GET /classrooms/{classroomId}/subjects](Subjects/GetSubjects.md) - list subjects in a classroom visible to the user.
