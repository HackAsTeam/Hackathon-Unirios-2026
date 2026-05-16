# GET /subjects/{subjectId}/activities

**Feature:** `src/HackathonUnirios2026.Application/Features/Exams/Queries/GetSubjectExamsQuery.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subjectId | string (uuid) | Yes | Subject ID from the route. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Activity ID. |
| subjectId | string (uuid) | Subject ID. |
| classroomId | string (uuid) | Classroom ID. |
| title | string | Activity title. |
| description | string | Activity description. |
| questionCount | number | Number of questions in the activity. |
| createdAt | string (date-time) | Creation timestamp. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 403 | Authenticated user does not belong to the subject classroom. |
| 404 | Subject does not exist. |

## Example

```http
GET /subjects/8a2e9735-6c44-4511-9bf7-818335624f09/activities
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "d7af8b29-a3ee-410f-93c0-dc4725763997",
    "subjectId": "8a2e9735-6c44-4511-9bf7-818335624f09",
    "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
    "title": "Fractions quiz",
    "description": "Basic fraction operations",
    "questionCount": 1,
    "createdAt": "2026-05-16T20:26:00Z"
  }
]
```
