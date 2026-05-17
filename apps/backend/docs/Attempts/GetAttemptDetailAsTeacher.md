# GET /attempts/{id}/teacher-view

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Queries/GetAttemptDetailAsTeacherQuery.cs`

Retorna o detalhe completo de uma tentativa de um aluno para revisão e avaliação pelo professor. O professor deve ser dono da turma do exam.

## Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (uuid) | ID da tentativa a visualizar. |

## Response `200`

Mesmo schema de `GET /attempts/{id}`:

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | ID da tentativa. |
| examId | string (uuid) | ID do exam. |
| examTitle | string | Título do exam. |
| classroomName | string | Nome da turma. |
| startedAt | string (date-time) | Início da tentativa. |
| submittedAt | string (date-time) \| null | Timestamp de submissão. |
| status | string | `"InProgress"`, `"Submitted"` ou `"Graded"`. |
| score | number \| null | Soma dos scores; null se ainda não avaliado. |
| answers | array | Respostas do aluno com feedback e pontuação. |
| answers[].id | string (uuid) | ID da resposta. |
| answers[].questionId | string (uuid) | ID da questão. |
| answers[].questionText | string | Texto da questão. |
| answers[].answerText | string \| null | Resposta dissertativa. |
| answers[].format | string \| null | Formato da resposta. |
| answers[].selectedOptionId | string (uuid) \| null | Opção selecionada. |
| answers[].score | number \| null | Score atribuído. |
| answers[].feedback | string \| null | Feedback do professor. |
| answers[].answeredAt | string (date-time) | Timestamp da resposta. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |
| 403 | O usuário autenticado não é o professor da turma do exam. |
| 404 | Tentativa não encontrada. |

## Example

```http
GET /attempts/a1b2c3d4-5555-6666-7777-888899990000/teacher-view
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
  "status": "Submitted",
  "score": null,
  "answers": [
    {
      "id": "f1a2b3c4-aaaa-bbbb-cccc-ddddeeee0001",
      "questionId": "q1a2b3c4-1111-2222-3333-000000000001",
      "questionText": "Explique o teorema de Pitágoras.",
      "answerText": "É a relação a² + b² = c² nos triângulos retângulos.",
      "format": "Text",
      "selectedOptionId": null,
      "score": null,
      "feedback": null,
      "answeredAt": "2026-05-16T18:10:00Z"
    }
  ]
}
```
