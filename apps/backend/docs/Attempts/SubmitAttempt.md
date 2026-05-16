# POST /attempts/{attemptId}/submit

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Commands/SubmitExamAttemptCommand.cs`

Finaliza uma tentativa em andamento sem enviar novas respostas. Útil para encerrar uma tentativa de questões abertas após salvar as respostas via [`POST /attempts/{attemptId}/answers`](SaveAnswer.md). Para múltipla escolha com correção automática, use [`POST /attempts/{attemptId}/submit-answers`](SubmitAnswers.md).

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attemptId | string (uuid) | Yes | Attempt ID na rota. Sem body. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Attempt ID. |
| examId | string (uuid) | Exam tentado. |
| studentId | string | User ID do aluno. |
| startedAt | string (date-time) | Início da tentativa. |
| submittedAt | string (date-time) | Timestamp de submissão. |
| status | string | `"Submitted"` após este endpoint. |
| answeredCount | number | Questões respondidas. |
| totalQuestions | number | Total de questões do exam. |
| score | number \| null | Null para questões abertas (corrigidas manualmente pelo professor). |

## Error responses

| Status | Condition |
|--------|-----------|
| 400 | Tentativa não está em andamento (já submetida). |
| 401 | Token ausente ou inválido. |
| 404 | Tentativa não encontrada ou não pertence ao aluno. |

## Example

```http
POST /attempts/a1b2c3d4-5555-6666-7777-888899990000/submit
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "a1b2c3d4-5555-6666-7777-888899990000",
  "examId": "e1b2c3d4-1111-2222-3333-444455556666",
  "studentId": "student-user-id",
  "startedAt": "2026-05-16T18:00:00Z",
  "submittedAt": "2026-05-16T18:30:00Z",
  "status": "Submitted",
  "answeredCount": 1,
  "totalQuestions": 1,
  "score": null
}
```
