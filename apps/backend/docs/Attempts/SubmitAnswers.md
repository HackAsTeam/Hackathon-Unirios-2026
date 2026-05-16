# POST /attempts/{attemptId}/submit-answers

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Commands/SubmitAttemptAnswersCommand.cs`

Envia todas as respostas de múltipla escolha de uma só vez e finaliza a tentativa com correção automática. O score é calculado imediatamente com base nas alternativas corretas.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attemptId | string (uuid) | Yes | Attempt ID na rota. |
| answers | array | Yes | Lista de respostas. |
| answers[].questionId | string (uuid) | Yes | ID da questão. |
| answers[].selectedOptionId | string (uuid) | Yes | ID da alternativa escolhida pelo aluno. |

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
| totalQuestions | number | Total de questões. |
| score | number | Score calculado automaticamente (0–100 ou escala definida). |

## Error responses

| Status | Condition |
|--------|-----------|
| 400 | Tentativa não está em andamento, ou respostas inválidas (ex: questionId não pertence ao exam). |
| 401 | Token ausente ou inválido. |
| 404 | Tentativa não encontrada. |

## Example

```http
POST /attempts/a1b2c3d4-5555-6666-7777-888899990000/submit-answers
Content-Type: application/json
Authorization: Bearer <token>

{
  "answers": [
    {
      "questionId": "aaaa-...",
      "selectedOptionId": "opt2-..."
    }
  ]
}
```

**Response:**

```json
{
  "id": "a1b2c3d4-5555-6666-7777-888899990000",
  "examId": "e1b2c3d4-1111-2222-3333-444455556666",
  "studentId": "student-user-id",
  "startedAt": "2026-05-16T18:00:00Z",
  "submittedAt": "2026-05-16T18:15:00Z",
  "status": "Submitted",
  "answeredCount": 1,
  "totalQuestions": 1,
  "score": 100.0
}
```
