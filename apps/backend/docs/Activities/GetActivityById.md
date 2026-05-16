# GET /activities/{id}

**Feature:** `src/HackathonUnirios2026.Application/Features/Exams/Queries/GetExamByIdQuery.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Activity ID from the route. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Activity ID. |
| subjectId | string (uuid) | Subject ID. |
| classroomId | string (uuid) | Classroom ID. |
| title | string | Activity title. |
| description | string | Activity description. |
| questions | array | Activity questions. |
| questions[].id | string (uuid) | Question ID. |
| questions[].orderIndex | number | Question display order. |
| questions[].text | string | Question text. |
| questions[].options | array | Multiple-choice options. |
| questions[].options[].id | string (uuid) | Option ID. |
| questions[].options[].orderIndex | number | Option display order. |
| questions[].options[].text | string | Option text. |
| createdAt | string (date-time) | Creation timestamp. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 403 | Authenticated user does not belong to the activity classroom. |
| 404 | Activity does not exist. |

## Example

```http
GET /activities/d7af8b29-a3ee-410f-93c0-dc4725763997
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "d7af8b29-a3ee-410f-93c0-dc4725763997",
  "subjectId": "8a2e9735-6c44-4511-9bf7-818335624f09",
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "title": "Fractions quiz",
  "description": "Basic fraction operations",
  "questions": [
    {
      "id": "e0426d81-b40d-4820-bd7a-6a09296a34b5",
      "orderIndex": 1,
      "text": "What is 1/2 + 1/4?",
      "options": [
        {
          "id": "778a15ed-dc49-4d7a-9920-2e81d4ec9657",
          "orderIndex": 1,
          "text": "1/4"
        },
        {
          "id": "7a4de95c-0185-46f6-98b9-88a3ed8e8c15",
          "orderIndex": 2,
          "text": "3/4"
        }
      ]
    }
  ],
  "createdAt": "2026-05-16T20:26:00Z"
}
```
