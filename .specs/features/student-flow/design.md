# Student Flow — Design

**Spec**: `.specs/features/student-flow/spec.md`
**Status**: Draft

---

## Architecture Overview

A feature toca três camadas: estado local (stores), dados do servidor (TanStack Query), e UI (telas e componentes).

```mermaid
graph TD
    subgraph Stores
        A[useAccessibilityStore\naccessibility.ts]
        B[useOnboardingStore\nonboarding.ts]
        C[useAuthStore\nauth.ts]
    end

    subgraph Queries
        D[useMyAttempts\nhooks/useMyAttempts.ts]
        E[useAttemptDetail\nhooks/useAttemptDetail.ts]
    end

    subgraph Screens
        F[TabsLayout\n_layout.tsx]
        G[StudentHome\nindex.tsx]
        H[ActivityDetail\nactivity/id.tsx]
        I[ResultsScreen\nresults.tsx]
        J[AttemptDetail\nattempt/id.tsx]
        K[ProfileScreen\nprofile.tsx]
    end

    subgraph SharedComponents
        L[AttemptStatusBadge]
        M[AttemptCard]
    end

    B -->|role| F
    C -->|token| D
    C -->|token| E
    A -->|defaultFormat| H
    A -->|fontSizeScale, highContrast| H
    A -->|fontSizeScale, highContrast| J
    A -->|prefs| K

    D -->|attempts[]| G
    D -->|attempts[]| I
    E -->|attemptDetail| J

    H -->|examId| D
    G --> L
    I --> M
    I --> L
    H --> L
    J --> L
```

**Decisão chave de cache**: `GET /attempts` é chamado uma única vez por sessão via query key `['my-attempts']`. Tanto `StudentHome` (badges) quanto `ResultsScreen` (lista) consomem o mesmo cache — zero requisições duplicadas.

---

## Code Reuse Analysis

### Componentes existentes a reutilizar

| Componente | Localização | Como usar |
|---|---|---|
| `AppButton` | `components/AppButton.tsx` | CTAs nas telas de detalhe de tentativa e resultados |
| `AppScreen` | `components/AppScreen.tsx` | Wrapper de tela em `results.tsx` e `attempt/[id].tsx` |
| `Header` | `components/ui/Header.tsx` | Cabeçalho com título e ação direita em todas as novas telas |
| `EmptyState` | `components/ui/EmptyState.tsx` | Empty state em `results.tsx` |
| `Card` | `components/ui/Card.tsx` | Cards de tentativa em `results.tsx` |
| `colors` | `lib/colors.ts` | Paleta unificada (verde) em todos os novos componentes |
| `apiFetch` | `lib/api.ts` | Todas as chamadas de API |
| `useReducedMotion` | `hooks/useReducedMotion.ts` | Combinado com preference da store (OR lógico) |

### Patterns existentes a seguir

| Pattern | Onde está | Aplicar em |
|---|---|---|
| Zustand store com `persist` (AsyncStorage) | `store/auth.ts`, `store/onboarding.ts` | `store/accessibility.ts` |
| TanStack Query com `enabled: !!token` | `app/(app)/(tabs)/index.tsx` | `useMyAttempts`, `useAttemptDetail` |
| Accordion expand com `expandedId` state | `StudentClassroomCard` em `index.tsx` | Reutilizar sem alterar o padrão |
| Route params via `useLocalSearchParams` | `activity/[id].tsx` | `attempt/[id].tsx` |

### Pontos de integração

| Sistema | Método |
|---|---|
| `GET /attempts` | Novo parâmetro sem filtro retorna todas as tentativas do aluno — já existe o endpoint |
| `GET /attempts?examId={id}` | Já existe — usado na tela de atividade para verificar status |
| `GET /attempts/{id}` | **Novo endpoint a criar** no backend |
| `AttemptResponse` | **Enriquecer** com `examTitle` e `classroomName` |

---

## Componentes

### `store/accessibility.ts` (novo)

- **Propósito**: Persistir preferências de acessibilidade do aluno localmente
- **Localização**: `apps/mobile/store/accessibility.ts`
- **Interface**:
  ```typescript
  type FontScale = 0.85 | 1.0 | 1.2 | 1.4;
  type ResponseFormat = 'text' | 'audio' | 'oral';

  interface AccessibilityState {
    defaultResponseFormat: ResponseFormat;
    fontSizeScale: FontScale;
    highContrast: boolean;
    reducedMotion: boolean;
    setDefaultFormat: (f: ResponseFormat) => void;
    setFontSizeScale: (s: FontScale) => void;
    setHighContrast: (v: boolean) => void;
    setReducedMotion: (v: boolean) => void;
  }
  ```
- **Padrão**: `create<AccessibilityState>()(persist(..., { name: 'accessibility-store' }))`
- **Reusa**: Padrão idêntico a `store/onboarding.ts`

---

### `hooks/useMyAttempts.ts` (novo)

- **Propósito**: Query compartilhada de tentativas — evita fetch duplicado entre home e results
- **Localização**: `apps/mobile/hooks/useMyAttempts.ts`
- **Interface**:
  ```typescript
  function useMyAttempts(): UseQueryResult<AttemptSummary[]>
  // queryKey: ['my-attempts']
  // queryFn: GET /attempts
  ```
- **Reusa**: `apiFetch`, `useAuthStore`

---

### `hooks/useAttemptDetail.ts` (novo)

- **Propósito**: Query de detalhe de tentativa individual com answers
- **Localização**: `apps/mobile/hooks/useAttemptDetail.ts`
- **Interface**:
  ```typescript
  function useAttemptDetail(attemptId: string): UseQueryResult<AttemptDetail>
  // queryKey: ['attempt', attemptId]
  // queryFn: GET /attempts/{attemptId}
  ```
- **Reusa**: `apiFetch`, `useAuthStore`

---

### `components/student/AttemptStatusBadge.tsx` (novo)

- **Propósito**: Badge visual reutilizável para status de tentativa
- **Localização**: `apps/mobile/components/student/AttemptStatusBadge.tsx`
- **Interface**:
  ```typescript
  type AttemptStatus = 'InProgress' | 'Submitted' | 'Graded' | null;

  function AttemptStatusBadge({ status, score }: {
    status: AttemptStatus;
    score?: number | null;
  }): JSX.Element
  ```
- **Comportamento visual**:
  | status | label | cor |
  |---|---|---|
  | `null` | `Pendente` | cinza (`colors.text.tertiary`) |
  | `InProgress` | `Em andamento` | amarelo/laranja |
  | `Submitted` | `Enviado ✓` | azul |
  | `Graded` | `★ {score}` | verde (`colors.primary`) |
- **Reusa**: `colors`, inline `View + Text` (sem `Card`)

---

### `components/student/AttemptCard.tsx` (novo)

- **Propósito**: Card de tentativa para a tela de Resultados
- **Localização**: `apps/mobile/components/student/AttemptCard.tsx`
- **Interface**:
  ```typescript
  function AttemptCard({ attempt, onPress }: {
    attempt: AttemptSummary;
    onPress: () => void;
  }): JSX.Element
  ```
- **Layout**:
  ```
  ┌────────────────────────────────────────┐
  │ [título da atividade]     [Badge]      │
  │ [nome da turma]                        │
  │ [data de envio]                        │
  └────────────────────────────────────────┘
  ```
- **Reusa**: `Card` de `components/ui/Card.tsx`, `AttemptStatusBadge`, `colors`

---

### `app/(app)/(tabs)/results.tsx` (novo)

- **Propósito**: Tela de resultados do aluno — lista todas as tentativas agrupadas
- **Localização**: `apps/mobile/app/(app)/(tabs)/results.tsx`
- **Dados**: `useMyAttempts()` — sem parâmetros
- **Agrupamento** (client-side):
  ```typescript
  const graded = attempts.filter(a => a.status === 'Graded');
  const submitted = attempts.filter(a => a.status === 'Submitted');
  const inProgress = attempts.filter(a => a.status === 'InProgress');
  ```
- **Reusa**: `AppScreen`, `Header`, `EmptyState`, `AttemptCard`, `AttemptStatusBadge`

---

### `app/(app)/attempt/[id].tsx` (novo)

- **Propósito**: Detalhe de uma tentativa — questões, respostas e feedback
- **Localização**: `apps/mobile/app/(app)/attempt/[id].tsx`
- **Params**: `id` via `useLocalSearchParams`
- **Dados**: `useAttemptDetail(id)`
- **Layout por questão**:
  ```
  ┌────────────────────────────────────────┐
  │ Questão 1                              │
  │ "Enunciado da questão"                 │
  │                                        │
  │ Sua resposta:                          │
  │ "Texto da resposta do aluno"           │
  │                                        │
  │ ✓ 1.0 pt — "Feedback do professor"    │  ← só se Graded
  └────────────────────────────────────────┘
  ```
- **Reusa**: `AppScreen`, `Header`, `AttemptStatusBadge`, `AppButton` (para "Continuar" se InProgress), `colors`, `useAccessibilityStore` (fontSizeScale, highContrast)

---

### `app/(app)/(tabs)/_layout.tsx` (editar)

- **Mudança**: Aba "Resultados" com `href` condicional por role
  ```tsx
  const role = useOnboardingStore((s) => s.role);
  // <Tabs.Screen name="results" options={{ href: role === 'student' ? undefined : null }} />
  ```
- **Ícone**: `Ionicons` `checkmark-done-circle-outline`
- **Reusa**: `useOnboardingStore` (já importado indiretamente via `colors`)

---

### `app/(app)/(tabs)/profile.tsx` (editar)

- **Mudança**: Adicionar seção "Acessibilidade" **antes** de "Privacidade & LGPD"
- **Controles**:
  ```
  Formato padrão de resposta:
  [ Texto ] [ Áudio ] [ Oral ]   ← segmented: TouchableOpacity trio com borda ativa

  Tamanho da fonte:
  [ A- ] [ A ] [ A+ ] [ A++ ]   ← 4 opções: 0.85 / 1.0 / 1.2 / 1.4

  Alto contraste     [toggle]
  Reduzir animações  [toggle]
  ```
- **Reusa**: `useAccessibilityStore`, `TouchableOpacity`, `colors`

---

### `app/(app)/activity/[id].tsx` (editar)

- **Mudanças**:
  1. Ao montar: busca `GET /attempts?examId={id}` → determina estado
  2. Renderiza CTA correto por estado (Iniciar / Continuar / Enviado / Ver resultado)
  3. Modal de formato pré-seleciona `useAccessibilityStore().defaultResponseFormat`
  4. Modo Áudio: botão `[▶ Ouvir questão]` `disabled` por questão (placeholder SF-13)
- **Reusa**: `useMyAttempts` (se já cacheado) OU `useQuery(['attempt-status', examId])`

> **Decisão**: Para a tela de atividade, usar `useQuery(['attempt-status', examId], () => apiFetch('/attempts?examId=...'))` separado do `['my-attempts']` — evita carregar todas as tentativas só para verificar uma.

---

### `app/(app)/(tabs)/index.tsx` — StudentClassroomCard (editar)

- **Mudança**: quando `expanded=true`, além de exams, busca `useMyAttempts()` (cache compartilhado)
- **Mapeamento**: `attempts.find(a => a.examId === exam.id)` → `status` + `score`
- **Renderiza**: `<AttemptStatusBadge status={...} score={...} />` ao lado do título do exam
- **Reusa**: `useMyAttempts` hook, `AttemptStatusBadge`

---

## Data Models

### Frontend — `types/attempt.ts` (novo arquivo)

```typescript
export interface AttemptSummary {
  id: string;
  examId: string;
  examTitle: string;       // enriquecido no backend
  classroomName: string;   // enriquecido no backend
  studentId: string;
  startedAt: string;
  submittedAt: string | null;
  status: 'InProgress' | 'Submitted' | 'Graded';
  answeredCount: number;
  totalQuestions: number;
  score: number | null;
}

export interface AttemptDetail extends Omit<AttemptSummary, 'answeredCount' | 'totalQuestions'> {
  answers: AnswerDetail[];
}

export interface AnswerDetail {
  id: string;
  questionId: string;
  questionText: string;     // join com Question no backend
  answerText: string | null;
  format: 'Text' | 'Audio' | 'Oral' | 'Video' | null;
  selectedOptionId: string | null;
  score: number | null;
  feedback: string | null;
  answeredAt: string;
}
```

### Backend — DTOs novos/alterados

**`AttemptResponse.cs`** — adicionar campos:
```csharp
record AttemptResponse(
    Guid Id,
    Guid ExamId,
    string ExamTitle,        // novo — join com Exam
    string ClassroomName,    // novo — join via Exam.ClassroomId → Classroom
    string StudentId,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    string Status,
    int AnsweredCount,
    int TotalQuestions,
    decimal? Score
);
```

**`AttemptDetailResponse.cs`** — novo:
```csharp
record AttemptDetailResponse(
    Guid Id,
    Guid ExamId,
    string ExamTitle,
    string ClassroomName,
    string StudentId,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    string Status,
    decimal? Score,
    List<AnswerDetailResponse> Answers
);

record AnswerDetailResponse(
    Guid Id,
    Guid QuestionId,
    string QuestionText,     // join com Question
    string? AnswerText,
    ResponseFormat? Format,
    Guid? SelectedOptionId,
    decimal? Score,
    string? Feedback,
    DateTime AnsweredAt
);
```

**`GetAttemptDetailQueryHandler.cs`** — query EF:
```csharp
var attempt = await db.ExamAttempts
    .Include(a => a.Answers)
    .Include(a => a.Exam)
        .ThenInclude(e => e.Classroom)
    .Include(a => a.Exam)
        .ThenInclude(e => e.Questions)
    .FirstOrDefaultAsync(a => a.Id == query.AttemptId && a.StudentId == userId);
```

Guard: `StudentId == currentUser` — 404 se não for o dono.

---

## Error Handling Strategy

| Cenário | Tratamento | O que o usuário vê |
|---|---|---|
| `GET /attempts?examId` falha na tela de atividade | Fallback: exibe CTA "Iniciar" | Pode abrir modal normalmente; backend protege tentativa duplicada |
| `GET /attempts` falha na tela Resultados | Query `isError` → estado de erro com botão "Tentar novamente" | "Não foi possível carregar seus resultados" |
| `GET /attempts/{id}` falha no detalhe | `isError` → mensagem + botão voltar | "Não foi possível carregar os detalhes" |
| `AttemptSummary` sem `examTitle` (contrato quebrado) | Fallback: exibir `"Atividade"` | Sem crash |
| Aluno sem tentativas | `attempts.length === 0` → `EmptyState` | "Você ainda não respondeu nenhuma atividade" |
| Role é `teacher` e acessa `/results` diretamente | Tab oculta; se rota direta → redirecionar para home | Transparente |

---

## Tech Decisions

| Decisão | Escolha | Razão |
|---|---|---|
| `reducedMotion` — store vs. sistema | OR lógico: `storeReducedMotion \|\| systemReducedMotion` | Respeita tanto a preferência explícita do app quanto a do sistema operacional |
| Fetch de status na home | `useMyAttempts()` (cache compartilhado) | Zero requisições duplicadas entre home e results; TanStack Query deduplica por key |
| Fetch de status na tela de atividade | Query separada `['attempt-status', examId]` | Evita carregar TODAS as tentativas só para verificar uma |
| Tipos de tentativa | Novo `types/attempt.ts` | Não poluir `types/classroom.ts` — domínios distintos |
| `AttemptStatusBadge` como componente separado | `components/student/` | Usado em 3 lugares (home, results, activity) — extrai para evitar duplicação |
| Segmented control para formato/fonte | `TouchableOpacity` trio com borda/bg ativo | Não adicionar nova dependência; padrão já usado no projeto |
