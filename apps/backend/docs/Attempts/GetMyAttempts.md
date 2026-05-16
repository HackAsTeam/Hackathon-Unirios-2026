# GET /attempts

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Queries/GetMyAttemptsQuery.cs`

Retorna todas as tentativas do aluno autenticado. Filtrável por exam via query param.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| examId | string (uuid) | No | Query parameter. Quando informado, retorna só as tentativas daquele exam. |

## Response `200`

Array de tentativas:

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Attempt ID. |
| examId | string (uuid) | Exam tentado. |
| studentId | string | User ID do aluno. |
| startedAt | string (date-time) | Início da tentativa. |
| submittedAt | string (date-time) \| null | Null se ainda em andamento. |
| status | string | `"InProgress"` ou `"Submitted"`. |
| answeredCount | number | Questões respondidas. |
| totalQuestions | number | Total de questões. |
| score | number \| null | Score calculado (múltipla escolha) ou null (aberta / não corrigida). |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |

## Example

```http
GET /attempts?examId=e1b2c3d4-1111-2222-3333-444455556666
Authorization: Bearer <token>
```

**Response:**

```json
[
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
]
```
