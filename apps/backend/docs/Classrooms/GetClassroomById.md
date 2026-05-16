# GET /classrooms/{id}

**Feature:** `src/HackathonUnirios2026.Application/Features/Classrooms/Queries/GetClassroomByIdQuery.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Classroom ID from the route. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Classroom ID. |
| title | string | Classroom title. |
| description | string | Classroom description. |
| teacherId | string | Teacher user ID. |
| teacherName | string | Teacher display name. |
| createdAt | string (date-time) | Creation timestamp. |
| enrollmentCount | number | Number of enrolled students. |
| subjects | array | Subjects in this classroom. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 404 | Classroom does not exist or the authenticated user does not belong to it. |

## Example

```http
GET /classrooms/9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "title": "Turma 1A",
  "description": "Primeiro ano",
  "teacherId": "teacher-user-id",
  "teacherName": "Teacher Name",
  "createdAt": "2026-05-16T15:00:00Z",
  "enrollmentCount": 12,
  "subjects": [
    {
      "id": "92e35c7a-8f8f-4a34-80ac-b9bb1dcf3fb1",
      "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
      "name": "Matematica",
      "description": null,
      "createdBy": "teacher-user-id",
      "createdAt": "2026-05-16T15:05:00Z"
    }
  ]
}
```
