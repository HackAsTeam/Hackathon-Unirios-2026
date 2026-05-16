# POST /invitations/join

**Feature:** `src/HackathonUnirios2026.Application/Features/Invitations/Commands/JoinClassroomByTokenCommand.cs`

Joins a classroom using an invitation token. The authenticated user becomes an enrolled student.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Invitation token obtained from the classroom teacher. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Enrollment record ID. |
| classroomId | string (uuid) | Classroom the user joined. |
| classroomTitle | string | Title of the classroom joined. |
| studentId | string | Identity user ID of the enrolled student. |
| joinedAt | string (date-time) | Enrollment timestamp. |

## Error responses

| Status | Condition |
|--------|-----------|
| 400 | Token is expired, the user is already enrolled, or the user is already the classroom teacher. |
| 401 | Missing or invalid bearer token. |
| 404 | No active invitation with the given token was found. |

## Example

```http
POST /invitations/join
Content-Type: application/json
Authorization: Bearer <token>

{
  "token": "abc123XYZ"
}
```

**Response:**

```json
{
  "id": "7f8e9d0c-abcd-ef01-2345-678901234567",
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "classroomTitle": "Turma 1A",
  "studentId": "student-user-id",
  "joinedAt": "2026-05-16T16:00:00Z"
}
```
