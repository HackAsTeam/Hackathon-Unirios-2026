# POST /attempts

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Commands/StartExamAttemptCommand.cs`

Inicia uma tentativa de exam para o aluno autenticado. O aluno precisa estar matriculado na classroom do exam.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| examId | string (uuid) | Yes | ID do exam a tentar. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Attempt ID. |
| examId | string (uuid) | Exam sendo tentado. |
| studentId | string | User ID do aluno. |
| startedAt | string (date-time) | Início da tentativa. |
| submittedAt | string (date-time) \| null | Null até a submissão. |
| status | string | `"InProgress"` após criação. |
| answeredCount | number | Questões respondidas até agora. |
| totalQuestions | number | Total de questões do exam. |
| score | number \| null | Null até a submissão (auto-calculado no submit). |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |
| 403 | Aluno não está matriculado na classroom do exam. |

## Example

```http
POST /attempts
Content-Type: application/json
Authorization: Bearer <token>

{
  "examId": "e1b2c3d4-1111-2222-3333-444455556666"
}
```

**Response:**

```json
{
  "id": "a1b2c3d4-5555-6666-7777-888899990000",
  "examId": "e1b2c3d4-1111-2222-3333-444455556666",
  "studentId": "student-user-id",
  "startedAt": "2026-05-16T18:00:00Z",
  "submittedAt": null,
  "status": "InProgress",
  "answeredCount": 0,
  "totalQuestions": 1,
  "score": null
}
```
