# POST /exams

**Feature:** `src/HackathonUnirios2026.Application/Features/Exams/Commands/CreateExamCommand.cs`

Cria um novo exam (com questões de múltipla escolha) vinculado a um subject. Apenas o professor da classroom pode criar exams.

> **Nota:** Para criar uma atividade vinculada diretamente a um subject use [`POST /subjects/{subjectId}/activities`](../Activities/CreateSubjectActivity.md), que é um alias mais conveniente para este mesmo endpoint.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subjectId | string (uuid) | Yes | ID do subject ao qual o exam pertence. |
| title | string | Yes | Título do exam. |
| description | string | No | Descrição do exam. |
| questions | array | Yes | Questões em ordem. |
| questions[].orderIndex | number | Yes | Posição da questão (sequencial). |
| questions[].text | string | Yes | Enunciado da questão. |
| questions[].options | array | Yes | Alternativas da questão (múltipla escolha). |
| questions[].options[].orderIndex | number | Yes | Posição da alternativa. |
| questions[].options[].text | string | Yes | Texto da alternativa. |
| questions[].options[].isCorrect | boolean | Yes | Se esta é a alternativa correta. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Exam ID. |
| subjectId | string (uuid) \| null | Subject ao qual o exam pertence. |
| classroomId | string (uuid) | Classroom à qual o exam pertence. |
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
| 400 | Exam inválido (ex: nenhuma questão, questão sem alternativa correta). |
| 401 | Token ausente ou inválido. |
| 403 | Usuário autenticado não é o professor da classroom. |
| 404 | Subject não encontrado. |

## Example

```http
POST /exams
Content-Type: application/json
Authorization: Bearer <token>

{
  "subjectId": "92e35c7a-8f8f-4a34-80ac-b9bb1dcf3fb1",
  "title": "Prova de Algebra",
  "description": "Primeira avaliação do semestre",
  "questions": [
    {
      "orderIndex": 1,
      "text": "Qual é o valor de x em 2x + 3 = 7?",
      "options": [
        { "orderIndex": 1, "text": "x = 1", "isCorrect": false },
        { "orderIndex": 2, "text": "x = 2", "isCorrect": true },
        { "orderIndex": 3, "text": "x = 3", "isCorrect": false }
      ]
    }
  ]
}
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
