# POST /classrooms/{classroomId}/subjects

**Feature:** `src/HackathonUnirios2026.Application/Features/Subjects/Commands/CreateSubjectCommand.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classroomId | string (uuid) | Yes | Classroom ID from the route. |
| name | string | Yes | Subject name. |
| description | string | No | Subject description. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Subject ID. |
| classroomId | string (uuid) | Classroom ID. |
| name | string | Subject name. |
| description | string | Subject description. |
| createdBy | string | User ID that created the subject. |
| createdAt | string (date-time) | Creation timestamp. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 403 | Authenticated user is not the classroom teacher. |

## Example

```http
POST /classrooms/9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2/subjects
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Matematica",
  "description": "Algebra e geometria"
}
```

**Response:**

```json
{
  "id": "92e35c7a-8f8f-4a34-80ac-b9bb1dcf3fb1",
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "name": "Matematica",
  "description": "Algebra e geometria",
  "createdBy": "teacher-user-id",
  "createdAt": "2026-05-16T15:05:00Z"
}
```
