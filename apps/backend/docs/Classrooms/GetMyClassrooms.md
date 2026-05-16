# GET /classrooms

**Feature:** `src/HackathonUnirios2026.Application/Features/Classrooms/Queries/GetMyClassroomsQuery.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| - | - | - | No request fields. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Classroom ID. |
| title | string | Classroom title. |
| description | string | Classroom description. |
| teacherId | string | Teacher user ID. |
| teacherName | string | Teacher display name. |
| createdAt | string (date-time) | Creation timestamp. |
| subjects | array | Subjects in this classroom. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |

## Example

```http
GET /classrooms
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
    "title": "Turma 1A",
    "description": "Primeiro ano",
    "teacherId": "teacher-user-id",
    "teacherName": "Teacher Name",
    "createdAt": "2026-05-16T15:00:00Z",
    "subjects": []
  }
]
```
