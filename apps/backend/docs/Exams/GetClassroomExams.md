# GET /exams/classroom/{classroomId}

**Feature:** `src/HackathonUnirios2026.Application/Features/Exams/Queries/GetClassroomExamsQuery.cs`

Retorna o resumo dos exams atribuídos a uma classroom. Não inclui questões nem alternativas.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classroomId | string (uuid) | Yes | Classroom ID na rota. |

## Response `200`

Array de resumos de exam:

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Exam ID. |
| subjectId | string (uuid) \| null | Subject ao qual o exam pertence, se houver. |
| classroomId | string (uuid) | Classroom do exam. |
| title | string | Título do exam. |
| description | string \| null | Descrição do exam. |
| questionCount | number | Total de questões. |
| createdAt | string (date-time) | Timestamp de criação. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |

## Example

```http
GET /exams/classroom/9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "e1b2c3d4-1111-2222-3333-444455556666",
    "subjectId": "92e35c7a-8f8f-4a34-80ac-b9bb1dcf3fb1",
    "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
    "title": "Prova de Algebra",
    "description": "Primeira avaliação do semestre",
    "questionCount": 1,
    "createdAt": "2026-05-16T17:00:00Z"
  }
]
```
