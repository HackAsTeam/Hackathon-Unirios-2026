# API Documentation

Base URL: `http://localhost:5099` (development)

## Authentication

Most endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

Tokens are obtained from the `/auth/register` or `/auth/login` endpoints.

---

## Auth Endpoints

See [Auth.md](Auth.md) for all auth-related endpoints (register, login, Google OAuth).

---

## Subjects Endpoints

### POST /subjects

**Feature:** `Features/Subjects/Commands/CreateSubjectCommand.cs`

Create a new subject.

**Auth:** Required

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Subject name (e.g., "Mathematics") |
| description | string | No | Subject description |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Subject unique identifier |
| name | string | Subject name |
| description | string | Subject description |
| createdAt | string (ISO 8601) | Creation timestamp |

**Example**

```http
POST /subjects
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Mathematics",
  "description": "Advanced calculus and algebra"
}
```

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Mathematics",
  "description": "Advanced calculus and algebra",
  "createdAt": "2026-05-15T10:30:00Z"
}
```

---

### GET /subjects

**Feature:** `Features/Subjects/Queries/GetSubjectsQuery.cs`

Retrieve all available subjects.

**Auth:** Required

**Response `200`**

Array of subject objects with the same structure as POST /subjects response.

**Example**

```http
GET /subjects
Authorization: Bearer <token>
```

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Mathematics",
    "description": "Advanced calculus and algebra",
    "createdAt": "2026-05-15T10:30:00Z"
  }
]
```

---

## Classrooms Endpoints

### POST /classrooms

**Feature:** `Features/Classrooms/Commands/CreateClassroomCommand.cs`

Create a new classroom.

**Auth:** Required (Teacher only)

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Classroom title |
| description | string | No | Classroom description |
| subjectId | string (uuid) | Yes | ID of the subject |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Classroom unique identifier |
| title | string | Classroom title |
| description | string | Classroom description |
| subjectId | string (uuid) | Subject identifier |
| subjectName | string | Name of the subject |
| teacherId | string (uuid) | ID of the teacher |
| teacherName | string | Teacher's display name |
| createdAt | string (ISO 8601) | Creation timestamp |

**Error responses**

| Status | Condition |
|--------|-----------|
| 404 | Subject not found |

**Example**

```http
POST /classrooms
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Calculus 101",
  "description": "Introduction to calculus",
  "subjectId": "123e4567-e89b-12d3-a456-426614174000"
}
```

```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "title": "Calculus 101",
  "description": "Introduction to calculus",
  "subjectId": "123e4567-e89b-12d3-a456-426614174000",
  "subjectName": "Mathematics",
  "teacherId": "550e8400-e29b-41d4-a716-446655440000",
  "teacherName": "Prof. Smith",
  "createdAt": "2026-05-15T11:00:00Z"
}
```

---

### GET /classrooms

**Feature:** `Features/Classrooms/Queries/GetMyClassroomsQuery.cs`

Retrieve classrooms where the current user is enrolled or is the teacher.

**Auth:** Required

**Response `200`**

Array of classroom objects with the same structure as POST /classrooms response.

**Example**

```http
GET /classrooms
Authorization: Bearer <token>
```

```json
[
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "title": "Calculus 101",
    "description": "Introduction to calculus",
    "subjectId": "123e4567-e89b-12d3-a456-426614174000",
    "subjectName": "Mathematics",
    "teacherId": "550e8400-e29b-41d4-a716-446655440000",
    "teacherName": "Prof. Smith",
    "createdAt": "2026-05-15T11:00:00Z"
  }
]
```

---

### GET /classrooms/{id}

**Feature:** `Features/Classrooms/Queries/GetClassroomByIdQuery.cs`

Retrieve detailed information about a specific classroom.

**Auth:** Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (uuid) | Classroom unique identifier |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Classroom unique identifier |
| title | string | Classroom title |
| description | string | Classroom description |
| subjectId | string (uuid) | Subject identifier |
| subjectName | string | Name of the subject |
| teacherId | string (uuid) | ID of the teacher |
| teacherName | string | Teacher's display name |
| createdAt | string (ISO 8601) | Creation timestamp |
| enrollmentCount | integer | Number of enrolled students |

**Error responses**

| Status | Condition |
|--------|-----------|
| 404 | Classroom not found |

**Example**

```http
GET /classrooms/223e4567-e89b-12d3-a456-426614174001
Authorization: Bearer <token>
```

```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "title": "Calculus 101",
  "description": "Introduction to calculus",
  "subjectId": "123e4567-e89b-12d3-a456-426614174000",
  "subjectName": "Mathematics",
  "teacherId": "550e8400-e29b-41d4-a716-446655440000",
  "teacherName": "Prof. Smith",
  "createdAt": "2026-05-15T11:00:00Z",
  "enrollmentCount": 25
}
```

---

## Invitations Endpoints

### POST /invitations

**Feature:** `Features/Invitations/Commands/GenerateInvitationLinkCommand.cs`

Generate an invitation link for a classroom.

**Auth:** Required (Teacher only)

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classroomId | string (uuid) | Yes | ID of the classroom |
| expiresAt | string (ISO 8601) | No | Expiration time |
| maxUses | integer | No | Maximum number of uses |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Invitation unique identifier |
| token | string | Invitation token to share |
| classroomId | string (uuid) | ID of the classroom |
| expiresAt | string (ISO 8601) | Expiration time |
| maxUses | integer | Maximum uses |
| useCount | integer | Current number of uses |
| isActive | boolean | Whether the invitation is valid |
| createdAt | string (ISO 8601) | Creation timestamp |

**Error responses**

| Status | Condition |
|--------|-----------|
| 403 | User is not a teacher |

**Example**

```http
POST /invitations
Content-Type: application/json
Authorization: Bearer <token>

{
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "expiresAt": "2026-06-15T10:30:00Z",
  "maxUses": 50
}
```

```json
{
  "id": "323e4567-e89b-12d3-a456-426614174002",
  "token": "CALC101ABC",
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "expiresAt": "2026-06-15T10:30:00Z",
  "maxUses": 50,
  "useCount": 0,
  "isActive": true,
  "createdAt": "2026-05-15T11:30:00Z"
}
```

---

### POST /invitations/join

**Feature:** `Features/Invitations/Commands/JoinClassroomByTokenCommand.cs`

Join a classroom using an invitation token.

**Auth:** Required

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Invitation token |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Enrollment unique identifier |
| classroomId | string (uuid) | ID of the classroom |
| classroomTitle | string | Title of the classroom |
| studentId | string (uuid) | ID of the enrolled student |
| joinedAt | string (ISO 8601) | Enrollment timestamp |

**Error responses**

| Status | Condition |
|--------|-----------|
| 400 | Invitation expired, maximum uses reached, or student already enrolled |
| 404 | Invitation token not found |

**Example**

```http
POST /invitations/join
Content-Type: application/json
Authorization: Bearer <token>

{
  "token": "CALC101ABC"
}
```

```json
{
  "id": "423e4567-e89b-12d3-a456-426614174003",
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "classroomTitle": "Calculus 101",
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "joinedAt": "2026-05-15T12:00:00Z"
}
```

---

### DELETE /invitations/{id}

**Feature:** `Features/Invitations/Commands/RevokeInvitationLinkCommand.cs`

Revoke an invitation link.

**Auth:** Required (Teacher only)

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (uuid) | Invitation unique identifier |

**Response `204`**

No content.

**Error responses**

| Status | Condition |
|--------|-----------|
| 403 | User is not a teacher |
| 404 | Invitation not found |

**Example**

```http
DELETE /invitations/323e4567-e89b-12d3-a456-426614174002
Authorization: Bearer <token>
```

---

## Exams Endpoints

### POST /exams

**Feature:** `Features/Exams/Commands/CreateExamCommand.cs`

Create a new exam with questions.

**Auth:** Required (Teacher only)

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classroomId | string (uuid) | Yes | ID of the classroom |
| title | string | Yes | Exam title |
| description | string | No | Exam description |
| questions | array | Yes | Array of questions |
| questions[].orderIndex | integer | Yes | Question order (0-based) |
| questions[].text | string | Yes | Question text |
| questions[].expectedAnswer | string | No | Expected answer for grading |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Exam unique identifier |
| classroomId | string (uuid) | ID of the classroom |
| title | string | Exam title |
| description | string | Exam description |
| questions | array | Array of questions |
| questions[].id | string (uuid) | Question unique identifier |
| questions[].orderIndex | integer | Question order |
| questions[].text | string | Question text |
| createdAt | string (ISO 8601) | Creation timestamp |

**Error responses**

| Status | Condition |
|--------|-----------|
| 403 | User is not a teacher |

**Example**

```http
POST /exams
Content-Type: application/json
Authorization: Bearer <token>

{
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "title": "Midterm Exam",
  "description": "Covers chapters 1-5",
  "questions": [
    {
      "orderIndex": 0,
      "text": "What is 2+2?",
      "expectedAnswer": "4"
    }
  ]
}
```

```json
{
  "id": "523e4567-e89b-12d3-a456-426614174004",
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "title": "Midterm Exam",
  "description": "Covers chapters 1-5",
  "questions": [
    {
      "id": "623e4567-e89b-12d3-a456-426614174005",
      "orderIndex": 0,
      "text": "What is 2+2?"
    }
  ],
  "createdAt": "2026-05-15T12:30:00Z"
}
```

---

### POST /exams/assign

**Feature:** `Features/Exams/Commands/AssignExamToClassroomCommand.cs`

Assign an exam to a classroom.

**Auth:** Required (Teacher only)

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| examId | string (uuid) | Yes | ID of the exam |
| classroomId | string (uuid) | Yes | ID of the classroom |
| dueAt | string (ISO 8601) | No | Due date |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Assignment unique identifier |
| classroomId | string (uuid) | ID of the classroom |
| examId | string (uuid) | ID of the exam |
| assignedAt | string (ISO 8601) | Assignment timestamp |
| dueAt | string (ISO 8601) | Due date |

**Error responses**

| Status | Condition |
|--------|-----------|
| 403 | User is not a teacher |
| 404 | Exam not found |

**Example**

```http
POST /exams/assign
Content-Type: application/json
Authorization: Bearer <token>

{
  "examId": "523e4567-e89b-12d3-a456-426614174004",
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "dueAt": "2026-05-22T10:30:00Z"
}
```

```json
{
  "id": "723e4567-e89b-12d3-a456-426614174007",
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "examId": "523e4567-e89b-12d3-a456-426614174004",
  "assignedAt": "2026-05-15T13:00:00Z",
  "dueAt": "2026-05-22T10:30:00Z"
}
```

---

### GET /exams/{id}

**Feature:** `Features/Exams/Queries/GetExamByIdQuery.cs`

Retrieve detailed information about a specific exam.

**Auth:** Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (uuid) | Exam unique identifier |

**Response `200`**

Same structure as POST /exams response.

**Error responses**

| Status | Condition |
|--------|-----------|
| 404 | Exam not found |

**Example**

```http
GET /exams/523e4567-e89b-12d3-a456-426614174004
Authorization: Bearer <token>
```

```json
{
  "id": "523e4567-e89b-12d3-a456-426614174004",
  "classroomId": "223e4567-e89b-12d3-a456-426614174001",
  "title": "Midterm Exam",
  "description": "Covers chapters 1-5",
  "questions": [
    {
      "id": "623e4567-e89b-12d3-a456-426614174005",
      "orderIndex": 0,
      "text": "What is 2+2?"
    }
  ],
  "createdAt": "2026-05-15T12:30:00Z"
}
```

---

### GET /exams/classroom/{classroomId}

**Feature:** `Features/Exams/Queries/GetClassroomExamsQuery.cs`

Retrieve all exams assigned to a classroom.

**Auth:** Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| classroomId | string (uuid) | Classroom unique identifier |

**Response `200`**

Array of exam objects with fields: id, classroomId, title, description, questionCount, createdAt.

**Example**

```http
GET /exams/classroom/223e4567-e89b-12d3-a456-426614174001
Authorization: Bearer <token>
```

```json
[
  {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "classroomId": "223e4567-e89b-12d3-a456-426614174001",
    "title": "Midterm Exam",
    "description": "Covers chapters 1-5",
    "questionCount": 2,
    "createdAt": "2026-05-15T12:30:00Z"
  }
]
```

---

## Exam Attempts Endpoints

### POST /attempts

**Feature:** `Features/ExamAttempts/Commands/StartExamAttemptCommand.cs`

Start a new exam attempt.

**Auth:** Required (Student only)

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| examId | string (uuid) | Yes | ID of the exam |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Attempt unique identifier |
| examId | string (uuid) | ID of the exam |
| studentId | string (uuid) | ID of the student |
| startedAt | string (ISO 8601) | When the attempt started |
| submittedAt | string (ISO 8601) | When the attempt was submitted |
| status | string | "InProgress" or "Submitted" |
| answeredCount | integer | Number of answered questions |
| totalQuestions | integer | Total number of questions |

**Error responses**

| Status | Condition |
|--------|-----------|
| 403 | Student is not enrolled in the classroom |

**Example**

```http
POST /attempts
Content-Type: application/json
Authorization: Bearer <token>

{
  "examId": "523e4567-e89b-12d3-a456-426614174004"
}
```

```json
{
  "id": "823e4567-e89b-12d3-a456-426614174008",
  "examId": "523e4567-e89b-12d3-a456-426614174004",
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "startedAt": "2026-05-15T13:30:00Z",
  "submittedAt": null,
  "status": "InProgress",
  "answeredCount": 0,
  "totalQuestions": 2
}
```

---

### POST /attempts/{attemptId}/answers

**Feature:** `Features/ExamAttempts/Commands/SaveAnswerCommand.cs`

Save an answer to a question.

**Auth:** Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| attemptId | string (uuid) | Exam attempt unique identifier |

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| questionId | string (uuid) | Yes | ID of the question |
| answerText | string | Yes | The student's answer |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Answer unique identifier |
| questionId | string (uuid) | ID of the question |
| answerText | string | The answer provided |
| score | decimal | Grade (null until graded) |
| feedback | string | Teacher's feedback (null until graded) |
| answeredAt | string (ISO 8601) | When the answer was submitted |

**Error responses**

| Status | Condition |
|--------|-----------|
| 400 | Attempt is not in progress |
| 404 | Attempt not found |

**Example**

```http
POST /attempts/823e4567-e89b-12d3-a456-426614174008/answers
Content-Type: application/json
Authorization: Bearer <token>

{
  "questionId": "623e4567-e89b-12d3-a456-426614174005",
  "answerText": "4"
}
```

```json
{
  "id": "923e4567-e89b-12d3-a456-426614174009",
  "questionId": "623e4567-e89b-12d3-a456-426614174005",
  "answerText": "4",
  "score": null,
  "feedback": null,
  "answeredAt": "2026-05-15T13:31:00Z"
}
```

---

### POST /attempts/{attemptId}/submit

**Feature:** `Features/ExamAttempts/Commands/SubmitExamAttemptCommand.cs`

Submit an exam attempt.

**Auth:** Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| attemptId | string (uuid) | Exam attempt unique identifier |

**Response `200`**

Same structure as POST /attempts response, with status "Submitted" and submittedAt populated.

**Error responses**

| Status | Condition |
|--------|-----------|
| 400 | Attempt is not in progress |
| 404 | Attempt not found |

**Example**

```http
POST /attempts/823e4567-e89b-12d3-a456-426614174008/submit
Authorization: Bearer <token>
```

```json
{
  "id": "823e4567-e89b-12d3-a456-426614174008",
  "examId": "523e4567-e89b-12d3-a456-426614174004",
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "startedAt": "2026-05-15T13:30:00Z",
  "submittedAt": "2026-05-15T13:45:00Z",
  "status": "Submitted",
  "answeredCount": 2,
  "totalQuestions": 2
}
```

---

### GET /attempts

**Feature:** `Features/ExamAttempts/Queries/GetMyAttemptsQuery.cs`

Retrieve all exam attempts by the current user.

**Auth:** Required

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| examId | string (uuid) | Filter by specific exam (optional) |

**Response `200`**

Array of attempt objects with the same structure as POST /attempts response.

**Example**

```http
GET /attempts?examId=523e4567-e89b-12d3-a456-426614174004
Authorization: Bearer <token>
```

```json
[
  {
    "id": "823e4567-e89b-12d3-a456-426614174008",
    "examId": "523e4567-e89b-12d3-a456-426614174004",
    "studentId": "550e8400-e29b-41d4-a716-446655440000",
    "startedAt": "2026-05-15T13:30:00Z",
    "submittedAt": "2026-05-15T13:45:00Z",
    "status": "Submitted",
    "answeredCount": 2,
    "totalQuestions": 2
  }
]
```

---

### POST /attempts/{attemptId}/answers/{answerId}/grade

**Feature:** `Features/ExamAttempts/Commands/GradeAnswerCommand.cs`

Grade a student's answer.

**Auth:** Required (Teacher only)

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| attemptId | string (uuid) | Exam attempt unique identifier |
| answerId | string (uuid) | Answer unique identifier |

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| score | decimal | Yes | Grade/score for the answer |
| feedback | string | No | Teacher's feedback |

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Answer unique identifier |
| questionId | string (uuid) | ID of the question |
| answerText | string | The student's answer |
| score | decimal | The assigned grade |
| feedback | string | Teacher's feedback |
| answeredAt | string (ISO 8601) | When the answer was submitted |

**Error responses**

| Status | Condition |
|--------|-----------|
| 403 | User is not a teacher |
| 404 | Attempt not found |

**Example**

```http
POST /attempts/823e4567-e89b-12d3-a456-426614174008/answers/923e4567-e89b-12d3-a456-426614174009/grade
Content-Type: application/json
Authorization: Bearer <token>

{
  "score": 10,
  "feedback": "Perfect answer!"
}
```

```json
{
  "id": "923e4567-e89b-12d3-a456-426614174009",
  "questionId": "623e4567-e89b-12d3-a456-426614174005",
  "answerText": "4",
  "score": 10,
  "feedback": "Perfect answer!",
  "answeredAt": "2026-05-15T13:31:00Z"
}
```

---

## Status Codes

All endpoints follow standard HTTP status codes:

- `200 OK` — Successful request
- `204 No Content` — Successful DELETE
- `400 Bad Request` — Invalid request data or validation error
- `401 Unauthorized` — Missing or invalid authentication
- `403 Forbidden` — Lacks permission (e.g., student creating exam)
- `404 Not Found` — Resource does not exist
- `500 Internal Server Error` — Unexpected server error
