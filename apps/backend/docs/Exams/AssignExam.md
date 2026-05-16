# POST /exams/assign

**Feature:** `src/HackathonUnirios2026.Application/Features/Exams/Commands/AssignExamToClassroomCommand.cs`

Atribui um exam existente a uma classroom, opcionalmente definindo um prazo. Apenas o professor pode fazer isso.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| examId | string (uuid) | Yes | ID do exam a atribuir. |
| classroomId | string (uuid) | Yes | ID da classroom. |
| dueAt | string (date-time) | No | Prazo para os alunos submeterem. Null = sem prazo. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | ID do registro de atribuição. |
| classroomId | string (uuid) | Classroom à qual o exam foi atribuído. |
| examId | string (uuid) | Exam atribuído. |
| assignedAt | string (date-time) | Timestamp da atribuição. |
| dueAt | string (date-time) \| null | Prazo, se definido. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |
| 403 | Usuário não é professor da classroom, ou classroom não encontrada. |
| 404 | Exam não encontrado. |

## Example

```http
POST /exams/assign
Content-Type: application/json
Authorization: Bearer <token>

{
  "examId": "e1b2c3d4-1111-2222-3333-444455556666",
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "dueAt": "2026-05-30T23:59:00Z"
}
```

**Response:**

```json
{
  "id": "f1f2f3f4-aaaa-bbbb-cccc-ddddeeee1111",
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "examId": "e1b2c3d4-1111-2222-3333-444455556666",
  "assignedAt": "2026-05-16T17:30:00Z",
  "dueAt": "2026-05-30T23:59:00Z"
}
```
