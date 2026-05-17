# Classroom Invite — Design

**Spec**: `.specs/features/classroom-invite/spec.md`
**Status**: Draft

---

## Architecture Overview

Fluxo direto: dois pontos de UI independentes que tocam o mesmo domínio de convites.

```
Teacher side                    Student side
─────────────────────           ─────────────────────
ClassroomDetailScreen           StudentHome
  └─ InviteSection               └─ JoinModal
       │                               │
       ▼                               ▼
  POST /invitations            POST /invitations/join
  DELETE /invitations/{id}
```

Não há estado compartilhado entre os dois lados — são flows independentes. Sem novo store necessário: estado local com `useState` é suficiente.

---

## Code Reuse Analysis

| Componente/Padrão | Onde está | Usar em |
|---|---|---|
| `useMutation` (TanStack Query) | `classroom/[id].tsx` (createSubject) | Gerar e revogar convite |
| `Modal` animado | `classroom/[id].tsx` (create subject) | JoinModal no StudentHome |
| `apiFetch` | `lib/api.ts` | Todos os novos calls |
| `useQueryClient.invalidateQueries` | `index.tsx` (createClassroom) | Após join bem-sucedido |
| `Share` | `react-native` (built-in) | Compartilhar inviteUrl |
| `colors` | `lib/colors.ts` | Estilo dos novos componentes |

---

## Components

### `ClassroomDetailScreen` — seção "Convite" (editar)

**Mudanças em `app/(app)/teacher/classroom/[id].tsx`**:

1. Adicionar estado local: `const [activeInvite, setActiveInvite] = useState<InvitationLinkResponse | null>(null)`
2. Adicionar mutation para gerar: `POST /invitations` → `setActiveInvite(result)`
3. Adicionar mutation para revogar: `DELETE /invitations/{id}` → `setActiveInvite(null)`
4. Renderizar seção abaixo de "Matérias":

```
┌────────────────────────────────────────┐
│ Convite de Alunos              [Gerar] │
│                                        │
│ ┌──────────────────────────────────┐  │  ← só quando activeInvite != null
│ │ 🔗 https://app.example/i/TOKEN  │  │
│ │ Usado 0 vez(es)                 │  │
│ │ [Compartilhar]        [Revogar] │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Estados do botão "Gerar":**
- Default: texto "Gerar Link"
- Pending: `ActivityIndicator` pequeno, botão desabilitado
- Error: toast/texto de erro inline embaixo do botão

**Mutation `generateInvite`:**
```typescript
useMutation({
  mutationFn: () => apiFetch<InvitationLinkResponse>('/invitations', {
    method: 'POST',
    token: token!,
    body: { classroomId: id, expiresAt: null },
  }),
  onSuccess: (data) => setActiveInvite(data),
})
```

**Mutation `revokeInvite`:**
```typescript
useMutation({
  mutationFn: (inviteId: string) => apiFetch(`/invitations/${inviteId}`, {
    method: 'DELETE',
    token: token!,
  }),
  onSuccess: () => setActiveInvite(null),
})
```

**Share:**
```typescript
Share.share({ message: activeInvite.inviteUrl })
```

---

### `StudentHome` — modal "Ingressar com código" (editar)

**Mudanças em `app/(app)/(tabs)/index.tsx`**:

1. Adicionar estado: `const [showJoin, setShowJoin] = useState(false)` e `const [joinInput, setJoinInput] = useState('')`
2. Adicionar mutation para join
3. Botão "Ingressar com código" no header da StudentHome (ao lado do badge de role)
4. `JoinModal` inline na função

**Extração de token da URL:**
```typescript
function extractToken(input: string): string {
  const match = input.match(/\/i\/([^/?#]+)/);
  return match ? match[1] : input.trim();
}
```

**Mutation `joinClassroom`:**
```typescript
useMutation({
  mutationFn: (token: string) => apiFetch('/invitations/join', {
    method: 'POST',
    token: authToken!,
    body: { token },
  }),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    setShowJoin(false);
    setJoinSuccess(data.classroomTitle);
  },
  onError: (e) => setJoinError(e.message),
})
```

**Layout JoinModal:**
```
┌──────────────────────────────────────┐
│ Ingressar em Turma                   │
│ ──────────────────────────────────── │
│ Cole o link ou código do professor:  │
│ ┌──────────────────────────────────┐ │
│ │ https://... ou token             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [erro se houver]                     │
│                                      │
│ [Cancelar]          [Confirmar ▶]   │
└──────────────────────────────────────┘
```

---

## Data Flow

```
Teacher generates:
  tap "Gerar" → POST /invitations { classroomId, expiresAt: null }
             → InvitationLinkResponse { inviteUrl, id, token, useCount }
             → setActiveInvite(response) → card rendered

Teacher shares:
  tap "Compartilhar" → Share.share({ message: inviteUrl }) → OS share sheet

Teacher revokes:
  tap "Revogar" → DELETE /invitations/{id}
              → setActiveInvite(null) → card removed

Student joins:
  paste URL/token → extractToken(input) → POST /invitations/join { token }
                → EnrollmentResponse { classroomTitle }
                → invalidate ['classrooms'] → modal closes + success message
```

---

## Error Handling

| Cenário | Tratamento |
|---|---|
| `POST /invitations` falha | Texto de erro abaixo do botão "Gerar"; botão re-habilitado |
| `DELETE /invitations/{id}` falha | Toast de erro; card permanece visível |
| `POST /invitations/join` → token inválido | Mensagem de erro dentro do modal; modal permanece aberto |
| `POST /invitations/join` → já matriculado | Mensagem "Você já faz parte desta turma" no modal |
| Share sheet cancelado | Sem ação (comportamento nativo do OS) |
