# Backend API Endpoints

## Core Documentation

- [Auth](Auth.md) — register, login, and Google OAuth endpoints
- [API](api.md) — comprehensive endpoint reference

## Endpoint Index

### Auth
- `POST /auth/register` — Register a new user account
- `POST /auth/login` — Authenticate with email and password
- `POST /auth/google` — Authenticate with Google ID token

### Subjects
- `POST /subjects` — Create a new subject
- `GET /subjects` — Retrieve all available subjects

### Classrooms
- `POST /classrooms` — Create a new classroom
- `GET /classrooms` — Retrieve user's classrooms
- `GET /classrooms/{id}` — Retrieve classroom details

### Invitations
- `POST /invitations` — Generate invitation link (teacher only)
- `POST /invitations/join` — Join classroom with invitation token
- `DELETE /invitations/{id}` — Revoke invitation (teacher only)

### Exams
- `POST /exams` — Create new exam (teacher only)
- `POST /exams/assign` — Assign exam to classroom (teacher only)
- `GET /exams/{id}` — Get exam details
- `GET /exams/classroom/{classroomId}` — Get classroom exams

### Exam Attempts
- `POST /attempts` — Start exam attempt
- `POST /attempts/{attemptId}/answers` — Save answer
- `POST /attempts/{attemptId}/submit` — Submit exam attempt
- `GET /attempts` — Get user's exam attempts
- `POST /attempts/{attemptId}/answers/{answerId}/grade` — Grade answer (teacher only)
