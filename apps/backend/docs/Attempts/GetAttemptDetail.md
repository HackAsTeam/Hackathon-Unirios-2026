# GET /attempts/{id}

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Queries/GetAttemptDetailQuery.cs`

Retorna o detalhe completo de uma tentativa do aluno autenticado, incluindo todas as respostas com texto da questão, feedback e pontuação.

## Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (uuid) | ID da tentativa. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | ID da tentativa. |
| examId | string (uuid) | ID do exam. |
| examTitle | string | Título do exam. |
| classroomName | string | Nome da turma do exam. |
| startedAt | string (date-time) | Início da tentativa. |
| submittedAt | string (date-time) \| null | Timestamp de submissão; null se ainda em andamento. |
| status | string | `"InProgress"`, `"Submitted"` ou `"Graded"`. |
| score | number \| null | Soma dos scores das respostas; null até ser avaliado. |
| answers | array | Lista de respostas. |
| answers[].id | string (uuid) | ID da resposta. |
| answers[].questionId | string (uuid) | ID da questão. |
| answers[].questionText | string | Texto da questão. |
| answers[].answerText | string \| null | Resposta dissertativa, se aplicável. |
| answers[].format | string \| null | Formato da resposta (`"Text"`, `"Markdown"`, etc.). |
| answers[].selectedOptionId | string (uuid) \| null | Opção escolhida, se múltipla escolha. |
| answers[].score | number \| null | Score atribuído pelo professor. Null até avaliação. |
| answers[].feedback | string \| null | Feedback do professor. |
| answers[].answeredAt | string (date-time) | Timestamp da resposta. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |
| 404 | Tentativa não encontrada ou não pertence ao aluno autenticado. |

## Example

```http
GET /attempts/a1b2c3d4-5555-6666-7777-888899990000
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "a1b2c3d4-5555-6666-7777-888899990000",
  "examId": "e1b2c3d4-1111-2222-3333-444455556666",
  "examTitle": "Prova de Matemática",
  "classroomName": "Turma A",
  "startedAt": "2026-05-16T18:00:00Z",
  "submittedAt": "2026-05-16T18:20:00Z",
  "status": "Graded",
  "score": 8.5,
  "answers": [
    {
      "id": "f1a2b3c4-aaaa-bbbb-cccc-ddddeeee0001",
      "questionId": "q1a2b3c4-1111-2222-3333-000000000001",
      "questionText": "Quanto é 2 + 2?",
      "answerText": null,
      "format": null,
      "selectedOptionId": "opt-correct-uuid",
      "score": 5.0,
      "feedback": "Correto!",
      "answeredAt": "2026-05-16T18:05:00Z"
    }
  ]
}
```
