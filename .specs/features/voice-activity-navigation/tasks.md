# Voice Activity Navigation — Tasks

**Design**: `.specs/features/voice-activity-navigation/design.md`
**Status**: Draft

Tarefas mobile em `apps/mobile` (verificação: `npx tsc --noEmit`). Tarefas
backend em `apps/backend` (verificação: `dotnet build HackathonUnirios2026.sln`).
Um commit atômico por tarefa.

## Execution Plan

```
Phase 1 — Fundação (paralelo, sem dependências)
  T1 [P] lib/queryClient.ts + app/_layout.tsx
  T2 [P] lib/studentActivities.ts
  T3 [P] store/voiceCommand.ts (pendingActivityPick)
  T6 [P] pendencias.tsx (scroll-to-section)
  T7 [P] backend — VoiceCommandPromptBuilder.cs
  T8 [P] backend — ProcessVoiceCommandCommandHandler.cs

Phase 2 — Dispatcher (após T1, T2, T3)
  T4  voiceCommandDispatcher.ts — Tier-1 + pre-check     depende T1,T2,T3
  T5  voiceCommandDispatcher.ts — postProcessAI + órfãos depende T1,T2

Phase 3 — Verificação (sequencial)
  T9  tsc + dotnet build + smoke test                    depende T1–T8
```

---

## Task Breakdown

### T1: Criar `lib/queryClient.ts` e compartilhar o singleton [P]

**What**: Extrair o `QueryClient` (hoje `const` local em `app/_layout.tsx:12`)
para um módulo importável fora da árvore React.
**Where**: `apps/mobile/lib/queryClient.ts` (novo); `apps/mobile/app/_layout.tsx` (editar)
**Depends on**: Nenhuma
**Reuses**: `@tanstack/react-query`
**Requirement**: VAN-01

**Done when**:
- [ ] `lib/queryClient.ts` exporta `export const queryClient = new QueryClient()`
- [ ] `app/_layout.tsx` importa `queryClient` do novo módulo (remove o `const` local)
- [ ] `<QueryClientProvider client={queryClient}>` continua funcionando
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: App inicia, telas com `useQuery` continuam carregando normalmente.
**Commit**: `refactor(mobile): extrai queryClient para modulo compartilhado`

---

### T2: Criar `lib/studentActivities.ts` — resolver e resumo [P]

**What**: Resolver de nome falado → atividade, obtenção cache-first e resumo
falado das pendências.
**Where**: `apps/mobile/lib/studentActivities.ts` (novo)
**Depends on**: Nenhuma (importa `queryClient`; T1 ideal mas não bloqueante para tipos)
**Reuses**: `normalizeStr` (`lib/normalize.ts`), `apiFetch` (`lib/api.ts`),
`queryClient` (`lib/queryClient.ts`), tipo `StudentActivityStatus` (`types/pending.ts`)
**Requirement**: VAN-02

**Done when**:
- [ ] Exporta `getStudentActivities(token): Promise<StudentActivityStatus[]>` —
      lê `queryClient.getQueryData(['student-activity-statuses'])`; se ausente,
      `apiFetch('/activities/my-status', { token })` e semeia via `setQueryData`
- [ ] Exporta `resolveActivityQuery(name, activities): ActivityResolution` com
      os 3 `kind`: `open` | `pick` | `none`, na ordem título → matéria
- [ ] "Disponível" = `attemptStatus` `null` ou `'InProgress'`
- [ ] Exporta `buildPendingSummary(activities, subjectFilter?): string` —
      agrupado por matéria, frase pt-BR, trata lista vazia
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Revisar manualmente: `resolveActivityQuery('matematica', [...])` com
1 atividade retorna `open`; com 2 retorna `pick`; nome inexistente → `none`.
**Commit**: `feat(mobile): adiciona resolver de atividades por voz`

---

### T3: Editar `store/voiceCommand.ts` — `pendingActivityPick` [P]

**What**: Estado para guardar as candidatas de uma desambiguação pendente.
**Where**: `apps/mobile/store/voiceCommand.ts`
**Depends on**: Nenhuma
**Reuses**: molde do `pendingConfirmAction` já existente
**Requirement**: VAN-03

**Done when**:
- [ ] Estado `pendingActivityPick: { activityId: string; activityTitle: string }[] | null` (init `null`)
- [ ] Setter `setPendingActivityPick(v)`
- [ ] `reset()` zera `pendingActivityPick`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Type check passa; `useVoiceCommandStore.getState().setPendingActivityPick([...])`
e `reset()` funcionam.
**Commit**: `feat(mobile): adiciona estado pendingActivityPick no store de voz`

---

### T4: Editar `voiceCommandDispatcher.ts` — padrões Tier-1 e pre-check

**What**: Padrões locais "atividade de/atividade \<título\>" e "listar
pendências", mais o pre-check de escolha pendente.
**Where**: `apps/mobile/lib/voiceCommandDispatcher.ts`
**Depends on**: T1, T2, T3
**Reuses**: `getStudentActivities`, `resolveActivityQuery`, `buildPendingSummary`,
`normalizeStr`, `speak`, `useVoiceCommandStore`
**Requirement**: VAN-04, VAN-05, VAN-06, VAN-07, VAN-08

**Done when**:
- [ ] No topo de `tryLocalDispatch`: se `pendingActivityPick` setado, casa
      transcript contra títulos das candidatas + ordinais; "cancelar" limpa;
      match → `router.push('/activity/<id>')` + limpar; sem match → limpar e
      cair fora (segue dispatch)
- [ ] Padrão `atividade de <X>` / `atividade <título>` (handler async) →
      `resolveActivityQuery`: `open` navega; `pick` seta `pendingActivityPick` e
      retorna `{ type: 'CONFIRM', command: 'PICK_ACTIVITY', speak: <lista> }`;
      `none` → `UNKNOWN` com "Não encontrei a atividade \<X\>."
- [ ] Padrão `listar|liste|lista (as )?pendências|atividades pendentes( de <X>)?`
      → push `/pendencias` + `speak(buildPendingSummary)`
- [ ] Novos padrões posicionados **antes** dos genéricos de `matéria`/`turma`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Com aluno logado: "atividade de \<matéria com 1\>" abre; "\<matéria com
≥2\>" lê a lista e o overlay re-escuta; dizer um título abre; "listar pendências"
navega e fala o resumo.
**Commit**: `feat(mobile): comandos de voz de atividade e listagem de pendencias`

---

### T5: Editar `voiceCommandDispatcher.ts` — `postProcessAI` e comandos órfãos

**What**: Casos de IA (`NAVIGATE_TO_ACTIVITY`, `LIST_PENDING_ACTIVITIES`) e
correção de `NAVIGATE_TO_SUBJECT`/`NAVIGATE_TO_CLASSROOM` do aluno.
**Where**: `apps/mobile/lib/voiceCommandDispatcher.ts`
**Depends on**: T1, T2
**Reuses**: `resolveActivityQuery`, `buildPendingSummary`, `getStudentActivities`,
`useOnboardingStore`/`useAuthStore`, `speak`
**Requirement**: VAN-09, VAN-10, VAN-11, VAN-12

**Done when**:
- [ ] `postProcessAI`: caso `NAVIGATE_TO_ACTIVITY` resolve via
      `resolveActivityQuery(payload.name)` (open/pick/none, igual ao Tier-1)
- [ ] `postProcessAI`: caso `LIST_PENDING_ACTIVITIES` → push `/pendencias` +
      `speak(buildPendingSummary(..., payload.subjectName))`
- [ ] Handler Tier-1 de `NAVIGATE_TO_SUBJECT` também faz
      `router.push('/(app)/(tabs)/pendencias')` (a tela rola — ver T6)
- [ ] Handler Tier-1 de `NAVIGATE_TO_CLASSROOM`: se papel = `student`, push
      `/pendencias` + `speak` neutro; professor inalterado
- [ ] Nenhum caminho de voz do aluno aponta para `/subject/[id]` ou `/student/classroom/[id]`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Forçar resposta de IA `NAVIGATE_TO_ACTIVITY` → cliente abre/desambigua.
Aluno "entra na turma X" → cai em Pendências. Professor "entra na turma X" →
comportamento atual.
**Commit**: `feat(mobile): trata comandos de IA de atividade e corrige comandos orfaos`

---

### T6: Editar `pendencias.tsx` — scroll-to-section para `NAVIGATE_TO_SUBJECT` [P]

**What**: Completar o scroll-to-section previsto no refactor anterior.
**Where**: `apps/mobile/app/(app)/(tabs)/pendencias.tsx`
**Depends on**: Nenhuma (funciona isolada; integra com T5 em runtime)
**Reuses**: `useEffect([lastCommand])` e o `grouped` Map já existentes;
`normalizeStr`, `speak`, `AccessibilityInfo` (react-native)
**Requirement**: VAN-12

**Done when**:
- [ ] `ScrollView` de `StudentPendencias` ganha `ref`
- [ ] Cada `View` de seção de matéria captura o offset `y` via `onLayout` em um
      `useRef<Record<string, number>>` por `subjectId`
- [ ] No ramo `NAVIGATE_TO_SUBJECT`: casa a matéria, `scrollTo({ y, animated: true })`,
      `speak("Mostrando <subject>.")` e `AccessibilityInfo.announceForAccessibility`
- [ ] Matéria não encontrada → `speak("Não encontrei a matéria <X>.")` sem rolar
- [ ] Scroll reexecuta se o offset ainda não estava pronto quando o comando chegou
- [ ] `TeacherPendencias` inalterado
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Aluno em Pendências (ou outra aba) → "entra na matéria X" → a lista
rola até a seção X e a matéria é anunciada.
**Commit**: `feat(mobile): rola ate a secao da materia em Pendencias por voz`

---

### T7: Editar `VoiceCommandPromptBuilder.cs` — `NAVIGATE_TO_ACTIVITY` [P]

**What**: Adicionar o comando ao vocabulário do prompt da IA.
**Where**: `apps/backend/src/HackathonUnirios2026.Infra/AI/VoiceCommandPromptBuilder.cs`
**Depends on**: Nenhuma
**Reuses**: estrutura de vocabulário já existente no arquivo
**Requirement**: VAN-13

**Done when**:
- [ ] `NAVIGATE_TO_ACTIVITY` descrito no vocabulário — parâmetro `name` (título
      da atividade ou matéria falada); instrução de retornar só o nome ouvido
- [ ] `LIST_PENDING_ACTIVITIES` documenta o parâmetro opcional `subjectName`
- [ ] `dotnet build HackathonUnirios2026.sln` → sucesso

**Verify**: Build passa; revisar que o texto do prompt enumera o novo comando.
**Commit**: `feat(ai): adiciona comando NAVIGATE_TO_ACTIVITY ao prompt de voz`

---

### T8: Editar `ProcessVoiceCommandCommandHandler.cs` — títulos no contexto [P]

**What**: Incluir títulos das atividades pendentes por matéria no contexto da IA.
**Where**: `apps/backend/.../Features/VoiceCommands/Commands/ProcessVoiceCommandCommandHandler.cs`
**Depends on**: Nenhuma
**Reuses**: a consulta de pendências já usada em `BuildUserContextAsync`
**Requirement**: VAN-14

**Done when**:
- [ ] `BuildUserContextAsync` (ramo do aluno) inclui os títulos das atividades
      pendentes agrupados por matéria (além das contagens atuais)
- [ ] A lista de títulos é limitada (~20) para conter o tamanho do prompt
- [ ] `dotnet build HackathonUnirios2026.sln` → sucesso

**Verify**: Build passa; um comando de voz de aluno mostra, no log do prompt,
títulos por matéria.
**Commit**: `feat(ai): inclui titulos das atividades no contexto de voz`

---

### T9: Verificação final — type check, build e smoke test [sequencial]

**What**: Type check, build do backend e validação ponta a ponta.
**Where**: `apps/mobile/` e `apps/backend/`
**Depends on**: T1–T8
**Requirement**: todos (VAN-01 … VAN-14)

**Done when**:
- [ ] `npx tsc --noEmit` em `apps/mobile` → 0 erros
- [ ] `dotnet build HackathonUnirios2026.sln` em `apps/backend` → sucesso
- [ ] "atividade de \<matéria com 1\>" abre a atividade
- [ ] "atividade de \<matéria com ≥2\>" lê a lista, overlay re-escuta, escolha abre
- [ ] "abrir atividade \<título\>" abre por título
- [ ] "listar pendências" e "...de \<matéria\>" navegam e leem o resumo correto
- [ ] "entra na matéria X" rola até a seção; "entra na turma X" do aluno cai em
      Pendências sem erro
- [ ] Caminho Tier-2: transcrição fora do Tier-1 → IA retorna `NAVIGATE_TO_ACTIVITY`
      → cliente resolve
- [ ] Professor: fluxo de voz inalterado; wake word e `VoiceAssistantButton`
      funcionam nas telas do aluno

**Verify**: Backend rodando (`dotnet run --project src/HackathonUnirios2026.API`),
`.env` do mobile com `EXPO_PUBLIC_API_URL`, `pnpm mobile` na raiz. Onde testar
microfone não for possível, dirigir `dispatch()` / `setLastCommand()` direto.
**Commit**: `chore: type check, build e smoke test da navegacao por voz`

---

## Parallel Execution Map

```
Phase 1 (paralelo):  T1, T2, T3, T6, T7, T8
Phase 2 (após T1-T3): T4 ; (após T1-T2): T5   — mesmo arquivo, executar T4 → T5
Phase 3 (sequencial): T9
```

> Nota: T4 e T5 editam o mesmo arquivo (`voiceCommandDispatcher.ts`) — executar
> em sequência (T4 depois T5), não em paralelo.

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1 | extrair singleton + 1 import | ✅ Granular |
| T2 | 1 módulo, 3 funções coesas | ✅ Granular |
| T3 | 1 campo de estado + setter | ✅ Granular |
| T4 | padrões Tier-1 + pre-check (1 feature) | ✅ Granular |
| T5 | casos de IA + correção de órfãos (1 feature) | ✅ Granular |
| T6 | 1 feature na tela (scroll) | ✅ Granular |
| T7 | 1 mudança no prompt | ✅ Granular |
| T8 | 1 mudança no contexto | ✅ Granular |
| T9 | smoke test | ✅ Granular |

## Tools

Nenhuma tarefa requer MCP ou Skill especial. Edição de arquivo padrão;
`npx tsc --noEmit` (mobile) e `dotnet build HackathonUnirios2026.sln` (backend)
para verificação. Commits atômicos, um por tarefa.
