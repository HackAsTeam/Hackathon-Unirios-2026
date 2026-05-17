# Student Flow — Tasks

**Design**: `.specs/features/student-flow/design.md`
**Status**: Draft

---

## Execution Plan

```
Phase 1 — Fundação (sequencial, sem dependências externas)
  T1 → T2 → T3

Phase 2 — Componentes e hooks (paralelo após T1-T3)
       ┌→ T4  [P] AttemptStatusBadge
  T3 ──┼→ T5  [P] AttemptCard
       └→ T6  [P] useMyAttempts + useAttemptDetail hooks

Phase 3 — Backend (paralelo com Phase 2)
  T7  [P] Enriquecer AttemptResponse
  T8  [P] Criar AttemptDetailResponse + GetAttemptDetailQuery
  T9       Registrar GET /attempts/{id} no endpoint (depende de T8)

Phase 4 — Telas novas (paralelo após T4, T5, T6, T9)
       ┌→ T10 [P] results.tsx
       └→ T11 [P] attempt/[id].tsx

Phase 5 — Telas editadas (paralelo após T4, T6, T9)
       ┌→ T12 [P] _layout.tsx — aba Resultados
       ├→ T13 [P] profile.tsx — seção Acessibilidade
       ├→ T14 [P] activity/[id].tsx — estado tentativa + formato padrão
       └→ T15 [P] index.tsx — badges de status (StudentClassroomCard)

Phase 6 — Verificação final (sequencial)
  T16      npx tsc --noEmit + smoke test end-to-end
```

---

## Task Breakdown

### T1: Criar `types/attempt.ts`

**What**: Definir interfaces TypeScript `AttemptSummary`, `AttemptDetail` e `AnswerDetail`
**Where**: `apps/mobile/types/attempt.ts`
**Depends on**: Nenhuma
**Requirement**: SF-08, SF-10, SF-11, SF-12

**Done when**:
- [ ] `AttemptSummary` exportado com todos os campos do design (inclui `examTitle`, `classroomName`)
- [ ] `AttemptDetail extends Omit<AttemptSummary, ...>` com `answers: AnswerDetail[]`
- [ ] `AnswerDetail` com `questionText`, `format`, `score`, `feedback`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: `npx tsc --noEmit` sem erros no arquivo

**Commit**: `feat(mobile): adiciona tipos AttemptSummary, AttemptDetail e AnswerDetail`

---

### T2: Criar `store/accessibility.ts`

**What**: Store Zustand com persist (AsyncStorage) para preferências de acessibilidade
**Where**: `apps/mobile/store/accessibility.ts`
**Depends on**: Nenhuma
**Reuses**: Padrão de `store/onboarding.ts` (persist com AsyncStorage)
**Requirement**: SF-01, SF-02, SF-03

**Done when**:
- [ ] `defaultResponseFormat: 'text' | 'audio' | 'oral'` com default `'text'`
- [ ] `fontSizeScale: 0.85 | 1.0 | 1.2 | 1.4` com default `1.0`
- [ ] `highContrast: boolean` com default `false`
- [ ] `reducedMotion: boolean` com default `false`
- [ ] Setters para cada campo
- [ ] `persist` com `name: 'accessibility-store'` usando AsyncStorage
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Importar `useAccessibilityStore` em qualquer tela, chamar `setHighContrast(true)`, recarregar → valor persiste

**Commit**: `feat(mobile): cria store de preferências de acessibilidade`

---

### T3: Backend — enriquecer `AttemptResponse` com `ExamTitle` e `ClassroomName`

**What**: Adicionar `ExamTitle` e `ClassroomName` ao record `AttemptResponse` e ao handler que o popula
**Where**:
- `apps/backend/src/HackathonUnirios2026.Application/Features/ExamAttempts/DTOs/AttemptResponse.cs`
- `apps/backend/src/HackathonUnirios2026.Application/Features/ExamAttempts/Queries/GetMyAttemptsQueryHandler.cs`
**Depends on**: Nenhuma
**Requirement**: SF-11

**Done when**:
- [ ] `AttemptResponse` record inclui `string ExamTitle` e `string ClassroomName`
- [ ] `GetMyAttemptsQueryHandler` faz join com `Exam` e `Classroom` via EF Core Include
- [ ] `dotnet build` → 0 erros
- [ ] `GET /attempts` retorna JSON com `examTitle` e `classroomName` populados

**Verify**: `curl -H "Authorization: Bearer {token}" http://localhost:5099/attempts` → response inclui `examTitle` e `classroomName`

**Commit**: `feat(backend): enriquece AttemptResponse com ExamTitle e ClassroomName`

---

### T4: Criar `components/student/AttemptStatusBadge.tsx` [P]

**What**: Componente visual reutilizável para badge de status de tentativa
**Where**: `apps/mobile/components/student/AttemptStatusBadge.tsx`
**Depends on**: T1 (usa tipos), T2 (não usa, mas aguarda estabilidade)
**Reuses**: `colors` de `lib/colors.ts`
**Requirement**: SF-04, SF-05, SF-08

**Done when**:
- [ ] Aceita props `{ status: 'InProgress' | 'Submitted' | 'Graded' | null, score?: number | null }`
- [ ] `null` → label `"Pendente"`, cor cinza
- [ ] `InProgress` → label `"Em andamento"`, cor âmbar
- [ ] `Submitted` → label `"Enviado ✓"`, cor azul
- [ ] `Graded` → label `"★ {score}"` (ex: `★ 8.5`), cor verde (`colors.primary`)
- [ ] `accessibilityLabel` descritivo em cada variante
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Renderizar manualmente nas 4 variantes e confirmar cor e label corretos

**Commit**: `feat(mobile): cria componente AttemptStatusBadge`

---

### T5: Criar `components/student/AttemptCard.tsx` [P]

**What**: Card clicável de tentativa para a tela de Resultados
**Where**: `apps/mobile/components/student/AttemptCard.tsx`
**Depends on**: T1, T4
**Reuses**: `Card` de `components/ui/Card.tsx`, `AttemptStatusBadge`, `colors`
**Requirement**: SF-08

**Done when**:
- [ ] Aceita props `{ attempt: AttemptSummary, onPress: () => void }`
- [ ] Exibe: título da atividade, nome da turma, data de envio (formato `dd/MM/yyyy`), `AttemptStatusBadge`
- [ ] `onPress` disparado ao toque
- [ ] `accessibilityRole="button"`, `accessibilityLabel` com nome da atividade e status
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Importar e renderizar com `AttemptSummary` mockado → layout correto

**Commit**: `feat(mobile): cria componente AttemptCard`

---

### T6: Criar hooks `useMyAttempts` e `useAttemptDetail` [P]

**What**: Dois hooks TanStack Query para buscar tentativas do aluno
**Where**: `apps/mobile/hooks/useMyAttempts.ts` e `apps/mobile/hooks/useAttemptDetail.ts`
**Depends on**: T1, T3 (backend precisa estar atualizado)
**Reuses**: `apiFetch` de `lib/api.ts`, `useAuthStore`, padrão de query em `index.tsx`
**Requirement**: SF-08, SF-10

**Done when**:
- [ ] `useMyAttempts()`: `queryKey: ['my-attempts']`, `GET /attempts`, retorna `AttemptSummary[]`
- [ ] `useAttemptDetail(id)`: `queryKey: ['attempt', id]`, `GET /attempts/{id}`, retorna `AttemptDetail`
- [ ] Ambos têm `enabled: !!token`
- [ ] Ambos têm `staleTime: 30_000` (30s de cache mínimo)
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Usar `useMyAttempts()` em componente temporário e confirmar que `data` tem tipo `AttemptSummary[]`

**Commit**: `feat(mobile): adiciona hooks useMyAttempts e useAttemptDetail`

---

### T7: Backend — criar `AttemptDetailResponse` e `GetAttemptDetailQuery` [P]

**What**: DTO + Query + Handler para `GET /attempts/{id}` com respostas detalhadas
**Where**:
- `apps/backend/src/HackathonUnirios2026.Application/Features/ExamAttempts/DTOs/AttemptDetailResponse.cs` (novo)
- `apps/backend/src/HackathonUnirios2026.Application/Features/ExamAttempts/Queries/GetAttemptDetailQuery.cs` (novo)
- `apps/backend/src/HackathonUnirios2026.Application/Features/ExamAttempts/Queries/GetAttemptDetailQueryHandler.cs` (novo)
**Depends on**: T3
**Requirement**: SF-12

**Done when**:
- [ ] `AttemptDetailResponse` contém `ExamTitle`, `ClassroomName`, `Status`, `Score`, `List<AnswerDetailResponse>`
- [ ] `AnswerDetailResponse` contém `QuestionText` (join com Question), `AnswerText`, `Format`, `Score`, `Feedback`
- [ ] Handler faz Include de `Answers`, `Exam.Classroom`, `Exam.Questions`
- [ ] Guard: retorna 404 se `StudentId != currentUser`
- [ ] `dotnet build` → 0 erros

**Verify**: `dotnet build` passa sem erros

**Commit**: `feat(backend): cria GetAttemptDetailQuery com AnswerDetailResponse`

---

### T8: Backend — registrar `GET /attempts/{id}` no endpoint

**What**: Adicionar rota `GET /attempts/{id:guid}` em `AttemptEndpoints.cs`
**Where**: `apps/backend/src/HackathonUnirios2026.API/Features/Attempts/AttemptEndpoints.cs`
**Depends on**: T7
**Requirement**: SF-12

**Done when**:
- [ ] `group.MapGet("/{id:guid}", ...)` registrado
- [ ] Dispara `GetAttemptDetailQuery` via MediatR
- [ ] Retorna 200 com `AttemptDetailResponse` ou 404
- [ ] Requer autenticação (`RequireAuthorization()`)
- [ ] `dotnet build` → 0 erros

**Verify**: `curl -H "Authorization: Bearer {token}" http://localhost:5099/attempts/{id}` → 200 com answers

**Commit**: `feat(backend): registra endpoint GET /attempts/{id}`

---

### T9: Criar `app/(app)/(tabs)/results.tsx` [P]

**What**: Tela de resultados do aluno com lista agrupada por status
**Where**: `apps/mobile/app/(app)/(tabs)/results.tsx`
**Depends on**: T5, T6
**Reuses**: `AppScreen`, `Header`, `EmptyState`, `AttemptCard`, `colors`
**Requirement**: SF-07, SF-08, SF-09

**Done when**:
- [ ] Usa `useMyAttempts()` para buscar dados
- [ ] Loading state: `ActivityIndicator`
- [ ] Empty state: `EmptyState` com ícone `📝` e mensagem `"Você ainda não respondeu nenhuma atividade"`
- [ ] Agrupamento: seção `"Avaliados"` → `"Enviados"` → `"Em andamento"` (omite seção se vazia)
- [ ] Cada item renderiza `AttemptCard` com `onPress` que navega para `/attempt/[id]`
- [ ] `accessibilityRole` e `accessibilityLabel` corretos
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Com pelo menos uma tentativa submetida → tela mostra card correto na seção "Enviados"

**Commit**: `feat(mobile): cria tela de Resultados com tentativas agrupadas por status`

---

### T10: Criar `app/(app)/attempt/[id].tsx` [P]

**What**: Tela de detalhe da tentativa com questões, respostas e feedback
**Where**: `apps/mobile/app/(app)/attempt/[id].tsx`
**Depends on**: T2, T4, T8
**Reuses**: `AppScreen`, `Header`, `AttemptStatusBadge`, `AppButton`, `colors`, `useAccessibilityStore`
**Requirement**: SF-10

**Done when**:
- [ ] Parâmetro `id` via `useLocalSearchParams`
- [ ] Usa `useAttemptDetail(id)` para buscar dados
- [ ] Cabeçalho exibe: nome da atividade, nome da turma, `AttemptStatusBadge`
- [ ] Se `Graded`: exibe nota total `"Nota: X / 10"` no cabeçalho
- [ ] Para cada questão: enunciado, resposta do aluno, e (se `Graded`) score parcial + feedback
- [ ] Se `Submitted`: label `"Aguardando avaliação do professor"` nos campos de score/feedback
- [ ] Se `InProgress`: botão `"Continuar respondendo"` que navega para a tela de resposta correta
- [ ] Respeita `fontSizeScale` e `highContrast` do `useAccessibilityStore`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Professor avalia tentativa → aluno abre `/attempt/[id]` → nota e feedback aparecem corretamente

**Commit**: `feat(mobile): cria tela de detalhe de tentativa com respostas e feedback`

---

### T11: Editar `_layout.tsx` — aba Resultados condicional por role [P]

**What**: Adicionar aba "Resultados" na bottom nav, visível apenas para alunos
**Where**: `apps/mobile/app/(app)/(tabs)/_layout.tsx`
**Depends on**: T9 (tela deve existir)
**Reuses**: `useOnboardingStore`, `Ionicons`, padrão de aba existente
**Requirement**: SF-07

**Done when**:
- [ ] Aba `results` adicionada com ícone `checkmark-done-circle-outline`
- [ ] `href: role === 'student' ? undefined : null` — invisível para professor
- [ ] Label: `"Resultados"`
- [ ] `tabBarActiveTintColor` e `tabBarInactiveTintColor` consistentes com demais abas
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Logar como professor → aba Resultados não aparece. Logar como aluno → aba aparece.

**Commit**: `feat(mobile): adiciona aba Resultados na bottom nav (somente alunos)`

---

### T12: Editar `profile.tsx` — seção Acessibilidade [P]

**What**: Adicionar seção com controles de preferências de acessibilidade na tela de Perfil
**Where**: `apps/mobile/app/(app)/(tabs)/profile.tsx`
**Depends on**: T2
**Reuses**: `useAccessibilityStore`, `TouchableOpacity`, `colors`
**Requirement**: SF-01, SF-02

**Done when**:
- [ ] Seção `"Acessibilidade"` inserida antes de `"Privacidade & LGPD"`
- [ ] Seletor de formato padrão: 3 botões (`Texto` / `Áudio` / `Oral`), botão ativo com borda e bg `colors.primary`
- [ ] Seletor de tamanho de fonte: 4 botões (`A-` / `A` / `A+` / `A++`), ativo destacado
- [ ] Toggle "Alto contraste" com estado de `highContrast`
- [ ] Toggle "Reduzir animações" com estado de `reducedMotion`
- [ ] Cada controle chama o setter correspondente do store
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Alterar formato para "Oral" → abrir atividade → modal abre com "Oral" pré-selecionado

**Commit**: `feat(mobile): adiciona seção de acessibilidade no perfil`

---

### T13: Editar `activity/[id].tsx` — estado de tentativa + formato padrão [P]

**What**: Verificar tentativa existente ao abrir atividade e adaptar CTA + pré-selecionar formato
**Where**: `apps/mobile/app/(app)/activity/[id].tsx`
**Depends on**: T2, T4, T3 (backend enriquecido)
**Reuses**: `useAccessibilityStore`, `AttemptStatusBadge`, `apiFetch`, `useAuthStore`
**Requirement**: SF-05, SF-06, SF-13

**Done when**:
- [ ] Ao montar: `useQuery(['attempt-status', id], GET /attempts?examId={id})`
- [ ] Sem tentativa → botão `"Iniciar Atividade"` + seletor de formato com default da preferência global
- [ ] `InProgress` → botão `"Continuar"` + `"X de Y questões respondidas"`
- [ ] `Submitted` → `AttemptStatusBadge status="Submitted"` + botão `"Ver detalhes"` → `/attempt/[id]`
- [ ] `Graded` → `AttemptStatusBadge status="Graded" score={...}` + botão `"Ver resultado"` → `/attempt/[id]`
- [ ] Modo "Áudio": botão `[▶ Ouvir questão]` `disabled` por questão com `accessibilityLabel="Leitura em voz alta — em breve"`
- [ ] Se query de tentativa falha → fallback para CTA "Iniciar" (comportamento conservador)
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Submeter atividade → reabrir tela → exibe "Enviado ✓" e não "Iniciar Atividade"

**Commit**: `feat(mobile): adiciona verificação de tentativa e formato padrão na tela de atividade`

---

### T14: Editar `index.tsx` — badges de status nas atividades (StudentClassroomCard) [P]

**What**: Exibir `AttemptStatusBadge` ao lado de cada atividade quando o accordion expande
**Where**: `apps/mobile/app/(app)/(tabs)/index.tsx` — função `StudentClassroomCard`
**Depends on**: T4, T6, T3 (backend atualizado)
**Reuses**: `useMyAttempts`, `AttemptStatusBadge`
**Requirement**: SF-04

**Done when**:
- [ ] `StudentClassroomCard` chama `useMyAttempts()` (usa cache compartilhado — zero fetch extra)
- [ ] Para cada exam: busca `attempts.find(a => a.examId === exam.id)`
- [ ] Renderiza `<AttemptStatusBadge status={attempt?.status ?? null} score={attempt?.score} />` ao lado do título
- [ ] Badge não aparece enquanto `useMyAttempts` está carregando (sem flash de "Pendente")
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Expandir turma na home → atividades exibem badges corretos por status

**Commit**: `feat(mobile): exibe badges de status nas atividades da home`

---

### T15: Verificação final e `tsc` [sequencial]

**What**: Rodar type check completo e validar fluxo end-to-end
**Where**: `apps/mobile/`
**Depends on**: T9, T10, T11, T12, T13, T14

**Done when**:
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] Como aluno: perfil → definir formato "Oral" → fechar → reabrir → preferência salva
- [ ] Como aluno: home → turma expandida → badges de status visíveis
- [ ] Como aluno: abrir atividade pendente → "Iniciar Atividade" + formato pré-selecionado "Oral"
- [ ] Como aluno: aba Resultados aparece; como professor: aba não aparece
- [ ] Como aluno: acessar `/attempt/[id]` de tentativa avaliada → nota e feedback visíveis
- [ ] Backend: `GET /attempts` retorna `examTitle` e `classroomName`
- [ ] Backend: `GET /attempts/{id}` retorna respostas com `questionText` e `feedback`

**Commit**: `chore: type check e smoke test do fluxo do aluno`

---

## Parallel Execution Map

```
Phase 1 (sequencial — fundação):
  T1 ──→ T2 ──→ T3

Phase 2 (paralelo — após T1, T2):
  T1 ──→ T4 [P] AttemptStatusBadge
  T1,T2 → T5 [P] AttemptCard
  T1,T3 → T6 [P] hooks useMyAttempts / useAttemptDetail

Phase 3 (paralelo — backend, independente da Phase 2):
  T7 [P] Query + DTO AttemptDetail
  T7 ──→ T8    Endpoint GET /attempts/{id}

Phase 4 (paralelo — após T5, T6, T8):
  ┌→ T9  [P] results.tsx
  └→ T10 [P] attempt/[id].tsx

Phase 5 (paralelo — após T4, T6, T8):
  ┌→ T11 [P] _layout.tsx (aba Resultados)
  ├→ T12 [P] profile.tsx (Acessibilidade)
  ├→ T13 [P] activity/[id].tsx (estado + formato)
  └→ T14 [P] index.tsx (badges)

Phase 6 (sequencial — tudo pronto):
  T15   verificação final
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: Criar `types/attempt.ts` | 1 arquivo, 3 interfaces | ✅ |
| T2: Criar `store/accessibility.ts` | 1 store | ✅ |
| T3: Enriquecer `AttemptResponse` (backend) | 1 DTO + 1 handler | ✅ |
| T4: `AttemptStatusBadge` | 1 componente | ✅ |
| T5: `AttemptCard` | 1 componente | ✅ |
| T6: `useMyAttempts` + `useAttemptDetail` | 2 hooks coesos, mesmo domínio | ✅ |
| T7: `AttemptDetailResponse` + Query backend | 3 arquivos, 1 endpoint lógico | ✅ |
| T8: Registrar rota backend | 1 linha em endpoint | ✅ |
| T9: `results.tsx` | 1 tela | ✅ |
| T10: `attempt/[id].tsx` | 1 tela | ✅ |
| T11: `_layout.tsx` | 1 mudança (1 aba) | ✅ |
| T12: `profile.tsx` | 1 seção nova | ✅ |
| T13: `activity/[id].tsx` | 1 tela (edição coesa) | ✅ |
| T14: `index.tsx` badges | 1 mudança em 1 componente | ✅ |
| T15: Verificação final | Smoke test | ✅ |
