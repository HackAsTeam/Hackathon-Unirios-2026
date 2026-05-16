# POST /attempts/{attemptId}/answers

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Commands/SaveAnswerCommand.cs`

Salva ou sobrescreve a resposta textual do aluno a uma questão dentro de uma tentativa em andamento. Para questões de múltipla escolha prefira [`POST /attempts/{attemptId}/submit-answers`](SubmitAnswers.md) que faz a correção automática.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attemptId | string (uuid) | Yes | Attempt ID na rota. |
| questionId | string (uuid) | Yes | ID da questão respondida. |
| answerText | string | Yes | Texto da resposta do aluno. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Answer record ID. |
| questionId | string (uuid) | Questão respondida. |
| selectedOptionId | string (uuid) \| null | Null para respostas textuais. |
| answerText | string \| null | Texto submetido. |
| score | number \| null | Null até o professor corrigir. |
| feedback | string \| null | Null até o professor fornecer feedback. |
| answeredAt | string (date-time) | Último salvamento. |

## Error responses

| Status | Condition |
|--------|-----------|
| 400 | Tentativa não está em andamento (já submetida). |
| 401 | Token ausente ou inválido. |
| 404 | Tentativa não encontrada ou não pertence ao aluno. |

## Example

```http
POST /attempts/a1b2c3d4-5555-6666-7777-888899990000/answers
Content-Type: application/json
Authorization: Bearer <token>

{
  "questionId": "aaaa-...",
  "answerText": "x = 2"
}
```

**Response:**

```json
{
  "id": "c1c2c3c4-1234-5678-abcd-ef0123456789",
  "questionId": "aaaa-...",
  "selectedOptionId": null,
  "answerText": "x = 2",
  "score": null,
  "feedback": null,
  "answeredAt": "2026-05-16T18:05:00Z"
}
```
