# GET /activities/{id}/attempts

**Feature:** `src/HackathonUnirios2026.Application/Features/ExamAttempts/Queries/GetActivityAttemptsQuery.cs`

Lista as tentativas submetidas ou avaliadas de uma atividade específica. Apenas o professor dono da turma da atividade pode acessar.

## Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (uuid) | ID da atividade (exam). |

## Response `200`

Array de objetos com resumo de cada tentativa:

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | ID da tentativa. |
| studentId | string | User ID do aluno. |
| studentName | string \| null | Nome de exibição do aluno. |
| avatarUrl | string \| null | URL do avatar do aluno. |
| status | string | `"Submitted"` ou `"Graded"`. |
| startedAt | string (date-time) | Início da tentativa. |
| submittedAt | string (date-time) \| null | Timestamp de submissão. |

Somente tentativas com status `Submitted` ou `Graded` são incluídas (tentativas `InProgress` são omitidas).

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |
| 403 | O usuário autenticado não é o professor da turma da atividade. |
| 404 | Atividade não encontrada. |

## Example

```http
GET /activities/d7af8b29-a3ee-410f-93c0-dc4725763997/attempts
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "a1b2c3d4-5555-6666-7777-888899990000",
    "studentId": "student-user-id",
    "studentName": "João Silva",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": "Submitted",
    "startedAt": "2026-05-16T18:00:00Z",
    "submittedAt": "2026-05-16T18:20:00Z"
  },
  {
    "id": "b2c3d4e5-6666-7777-8888-999900001111",
    "studentId": "another-student-id",
    "studentName": "Maria Souza",
    "avatarUrl": null,
    "status": "Graded",
    "startedAt": "2026-05-16T19:00:00Z",
    "submittedAt": "2026-05-16T19:15:00Z"
  }
]
```
