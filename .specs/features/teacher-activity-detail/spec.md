# Spec: Trajeto do professor — criação e detalhe de atividade

## Contexto

O botão "Criar Atividade" em `new-activity.tsx` não completa a requisição `POST /subjects/{subjectId}/activities`. Dois problemas:

1. **Bug de criação**: não há guard para `subjectId` undefined (vem via query string de `useLocalSearchParams`). Se por qualquer razão o param não chegar, `apiFetch` chama `/subjects/undefined/activities`, o backend rejeita com 404, e o único feedback é um `Alert.alert` que o usuário não associa ao botão.

2. **Trajeto incompleto**: após criar uma atividade o professor não tem tela para ver o detalhe (perguntas, opções). O fluxo termina na lista de atividades sem possibilidade de inspeção.

## Goal

Corrigir o fluxo de criação de atividade e completar o trajeto do professor com uma tela de detalhe que consome `GET /activities/{id}`.

---

## Requirements

### REQ-1 — Guard de subjectId em new-activity
Se `subjectId` for `undefined` ao montar a tela, exibir uma mensagem de erro inline na tela e desabilitar o formulário. Não lançar exceção silenciosa.

### REQ-2 — Feedback de erro inline no submit
Substituir o `Alert.alert` do `onError` por um estado de erro exibido inline no footer, acima dos botões. O `Alert.alert` de validação (`validate()`) pode permanecer, pois é pré-requisição.

### REQ-3 — Tela de detalhe de atividade para professor
Rota: `/teacher/activity/[id]`

Exibe:
- Header com back navigation ("Atividades") e título da atividade
- Card de info: título, descrição (se houver), contagem de perguntas, data de criação
- Lista numerada de perguntas com o texto de cada questão
- Para questões múltipla escolha: lista de opções (texto apenas, sem indicar correta — API não retorna `isCorrect`)
- Para questões discursivas: badge "Discursiva"

### REQ-4 — Cards de atividade navegáveis em subject/[subjectId]
Os cards de atividade na tela de matérias são atualmente `View` estáticos. Devem se tornar `TouchableOpacity` navegando para `/teacher/activity/${a.id}`.

### REQ-5 — Rota registrada no stack
A rota `teacher/activity/[id]` deve ser acessível via Expo Router. Com file-based routing o arquivo em `app/(app)/teacher/activity/[id].tsx` é suficiente; não é necessário registro explícito em `_layout.tsx` (o Stack com `screenOptions={{ headerShown: false }}` já descobre).

---

## API surface

| Operação | Endpoint |
|---|---|
| Criar atividade | `POST /subjects/{subjectId}/activities` |
| Detalhe da atividade | `GET /activities/{id}` |

### Contrato `GET /activities/{id}` → `ExamDetailResponse`

```json
{
  "id": "guid",
  "subjectId": "guid | null",
  "classroomId": "guid",
  "title": "string",
  "description": "string | null",
  "questions": [
    {
      "id": "guid",
      "orderIndex": 0,
      "text": "string",
      "options": [
        { "id": "guid", "orderIndex": 0, "text": "string" }
      ]
    }
  ],
  "createdAt": "ISO8601"
}
```

Tipo `ExamDetail` em `types/classroom.ts` já é compatível — sem alteração de tipo necessária.

---

## Fora do escopo

- Editar ou excluir atividades
- Ver respostas dos alunos na tela de detalhe do professor
- Grading inline
