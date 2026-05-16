# GET /classrooms/{classroomId}/subjects

**Feature:** `src/HackathonUnirios2026.Application/Features/Subjects/Queries/GetSubjectsQuery.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classroomId | string (uuid) | Yes | Classroom ID from the route. |

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
| 404 | Classroom does not exist or the authenticated user does not belong to it. |

## Example

```http
GET /classrooms/9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2/subjects
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "92e35c7a-8f8f-4a34-80ac-b9bb1dcf3fb1",
    "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
    "name": "Matematica",
    "description": "Algebra e geometria",
    "createdBy": "teacher-user-id",
    "createdAt": "2026-05-16T15:05:00Z"
  }
]
```
