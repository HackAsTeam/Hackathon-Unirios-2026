# POST /attempts/{attemptId}/submit-answers

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Commands/SubmitAttemptAnswersCommand.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attemptId | string (uuid) | Yes | Attempt ID from the route. |
| answers | array | Yes | One answer for each activity question. |
| answers[].questionId | string (uuid) | Yes | Question ID. |
| answers[].selectedOptionId | string (uuid) | Yes | Selected option ID for the question. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Attempt ID. |
| examId | string (uuid) | Activity ID. |
| studentId | string | Student user ID. |
| startedAt | string (date-time) | Attempt start timestamp. |
| submittedAt | string (date-time) | Attempt submission timestamp. |
| status | string | Attempt status. |
| answeredCount | number | Number of submitted answers. |
| totalQuestions | number | Number of activity questions. |
| score | number | Number of correct selected options. |

## Error responses

| Status | Condition |
|--------|-----------|
| 400 | Attempt is not in progress, answers are missing or duplicated, or an option does not belong to its question. |
| 401 | Missing or invalid bearer token. |
| 404 | Attempt does not exist for the authenticated student. |

## Example

```http
POST /attempts/a4667d14-5685-4e56-8d96-50b3f8a4f2fd/submit-answers
Content-Type: application/json
Authorization: Bearer <token>

{
  "answers": [
    {
      "questionId": "e0426d81-b40d-4820-bd7a-6a09296a34b5",
      "selectedOptionId": "7a4de95c-0185-46f6-98b9-88a3ed8e8c15"
    }
  ]
}
```

**Response:**

```json
{
  "id": "a4667d14-5685-4e56-8d96-50b3f8a4f2fd",
  "examId": "d7af8b29-a3ee-410f-93c0-dc4725763997",
  "studentId": "student-user-id",
  "startedAt": "2026-05-16T20:30:00Z",
  "submittedAt": "2026-05-16T20:35:00Z",
  "status": "Submitted",
  "answeredCount": 1,
  "totalQuestions": 1,
  "score": 1
}
```
