# POST /attempts/{attemptId}/answers/{answerId}/grade

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Commands/GradeAnswerCommand.cs`

Assigns a score and optional feedback to a student's answer. Only the classroom teacher can grade answers.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attemptId | string (uuid) | Yes | Attempt ID from the route. |
| answerId | string (uuid) | Yes | Answer record ID from the route. |
| score | number (decimal) | Yes | Numeric score awarded to the answer. |
| feedback | string | No | Optional written feedback for the student. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Answer record ID. |
| questionId | string (uuid) | Question that was answered. |
| answerText | string | Student's submitted answer text. |
| score | number | Score awarded by the teacher. |
| feedback | string \| null | Teacher feedback, if provided. |
| answeredAt | string (date-time) | When the answer was last saved by the student. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 403 | Authenticated user is not the classroom teacher. |
| 404 | Attempt or answer does not exist. |

## Example

```http
POST /attempts/a1b2c3d4-5555-6666-7777-888899990000/answers/c1c2c3c4-1234-5678-abcd-ef0123456789/grade
Content-Type: application/json
Authorization: Bearer <token>

{
  "score": 10.0,
  "feedback": "Perfeito!"
}
```

**Response:**

```json
{
  "id": "c1c2c3c4-1234-5678-abcd-ef0123456789",
  "questionId": "aaaa-...",
  "answerText": "x = 2",
  "score": 10.0,
  "feedback": "Perfeito!",
  "answeredAt": "2026-05-16T18:05:00Z"
}
```
