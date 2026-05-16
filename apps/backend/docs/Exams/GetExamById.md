# GET /exams/{id}

**Feature:** `src/HackathonUnirios2026.Application/Features/Exams/Queries/GetExamByIdQuery.cs`

Retorna o detalhe completo de um exam, incluindo todas as questões e alternativas.

> Também acessível via `GET /activities/{id}`.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Exam ID na rota. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Exam ID. |
| subjectId | string (uuid) \| null | Subject ao qual o exam pertence. |
| classroomId | string (uuid) | Classroom do exam. |
| title | string | Título do exam. |
| description | string \| null | Descrição do exam. |
| questions | array | Questões em ordem. |
| questions[].id | string (uuid) | Question ID. |
| questions[].orderIndex | number | Posição. |
| questions[].text | string | Enunciado. |
| questions[].options | array | Alternativas. |
| questions[].options[].id | string (uuid) | Option ID. |
| questions[].options[].orderIndex | number | Posição da alternativa. |
| questions[].options[].text | string | Texto da alternativa. |
| createdAt | string (date-time) | Timestamp de criação. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |
| 403 | Usuário não pertence à classroom do exam. |
| 404 | Exam não encontrado. |

## Example

```http
GET /exams/e1b2c3d4-1111-2222-3333-444455556666
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "e1b2c3d4-1111-2222-3333-444455556666",
  "subjectId": "92e35c7a-8f8f-4a34-80ac-b9bb1dcf3fb1",
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "title": "Prova de Algebra",
  "description": "Primeira avaliação do semestre",
  "questions": [
    {
      "id": "aaaa-...",
      "orderIndex": 1,
      "text": "Qual é o valor de x em 2x + 3 = 7?",
      "options": [
        { "id": "opt1-...", "orderIndex": 1, "text": "x = 1" },
        { "id": "opt2-...", "orderIndex": 2, "text": "x = 2" },
        { "id": "opt3-...", "orderIndex": 3, "text": "x = 3" }
      ]
    }
  ],
  "createdAt": "2026-05-16T17:00:00Z"
}
```
