# Student Navigation Refactor — Tasks

**Design**: `.specs/features/student-navigation-refactor/design.md`
**Status**: Draft

Todas as tarefas são executadas em `apps/mobile`. O type check de verificação é
`npx tsc --noEmit` rodado a partir de `apps/mobile/`. Um commit atômico por
tarefa.

---

## Execution Plan

```
Phase 1 — Fundação (paralelo, sem dependências)
  T1 [P] lib/routes.ts
  T2 [P] components/student/JoinClassroomSheet.tsx

Phase 2 — Roteamento de entrada (paralelo, após T1)
  ┌→ T3 [P] app/index.tsx
  ├→ T4 [P] app/(auth)/_layout.tsx
  ├→ T5 [P] app/(app)/onboarding.tsx
  └→ T6 [P] app/invite/[token].tsx
  T7 [P] app/(app)/(tabs)/_layout.tsx   (independente — pode rodar já na Phase 1)

Phase 3 — Telas (após Phase 1)
  T8  (tabs)/index.tsx          depende de T1, T2
  T9  (tabs)/pendencias.tsx     depende de T2

Phase 4 — Voz (após T1, T9)
  T10 [P] voiceCommandDispatcher.ts   depende de T1
  T11     pendencias.tsx (voz)         depende de T9, T10

Phase 5 — Limpeza (após T8, T9)
  T12 [P] respond/[id]/{text,oral,audio}.tsx
  T13     remover telas órfãs          depende de T8, T12

Phase 6 — Verificação (sequencial)
  T14 tsc + smoke test                 depende de tudo
```

---

## Task Breakdown

### T1: Criar `lib/routes.ts` — helper `landingRouteForRole` [P]

**What**: Função pura que mapeia o papel do usuário para a rota inicial.
**Where**: `apps/mobile/lib/routes.ts` (novo)
**Depends on**: Nenhuma
**Reuses**: tipo `Href` de `expo-router`
**Requirement**: SNR-01

**Done when**:
- [ ] Exporta `landingRouteForRole(role: string | null | undefined): Href`
- [ ] `role === 'student'` (case-insensitive) → `'/(app)/(tabs)/pendencias'`
- [ ] Qualquer outro valor, `null` ou `undefined` → `'/(app)/(tabs)'`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: `npx tsc --noEmit` sem erros; revisar que `landingRouteForRole('student')`
e `landingRouteForRole('STUDENT')` retornam a rota de pendências.

**Commit**: `feat(mobile): adiciona helper landingRouteForRole`

---

### T2: Criar `components/student/JoinClassroomSheet.tsx` [P]

**What**: Componente de folha (bottom sheet) para ingressar em turma, extraído
da lógica hoje embutida em `StudentHome`.
**Where**: `apps/mobile/components/student/JoinClassroomSheet.tsx` (novo)
**Depends on**: Nenhuma
**Reuses**: markup do `Modal` slide, `extractToken` e a mutation `joinClassroom`
de `app/(app)/(tabs)/index.tsx` (`StudentHome`); `useAuthStore`, `useQueryClient`,
`useColors`, `useScale`, `apiFetch`
**Requirement**: SNR-08

**Done when**:
- [ ] Props: `{ visible: boolean; onClose: () => void; onJoined?: (classroomTitle: string) => void }`
- [ ] Contém `Modal` (`transparent`, `animationType="slide"`, `accessibilityViewIsModal`)
- [ ] Contém o `TextInput` de link/código e o helper `extractToken`
- [ ] Mutation `POST /invitations/join` com tratamento de erro: já matriculado →
      "Você já faz parte desta turma."; inválido/expirado → "Link inválido ou
      expirado. Peça um novo convite ao professor."; genérico → "Não foi possível
      ingressar na turma. Tente novamente."
- [ ] No sucesso: `queryClient.invalidateQueries` para `['classrooms']` e
      `['student-activity-statuses']`, chama `onJoined(classroomTitle)` e `onClose()`
- [ ] Botões Cancelar e Confirmar têm `accessibilityLabel` e `accessibilityRole="button"`
- [ ] Textos usam `useScale()`; cores usam `useColors()`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Importar `<JoinClassroomSheet visible onClose={()=>{}} />` numa tela
temporária; a folha abre, aceita texto e o type check passa.

**Commit**: `feat(mobile): cria componente JoinClassroomSheet`

---

### T3: Editar `app/index.tsx` — redirect inicial por papel [P]

**What**: O redirect de usuário logado e com onboarding completo passa a
depender do papel.
**Where**: `apps/mobile/app/index.tsx`
**Depends on**: T1
**Reuses**: `landingRouteForRole`, `useAuthStore`, `useOnboardingStore`
**Requirement**: SNR-02

**Done when**:
- [ ] Lê `role = useOnboardingStore((s) => s.role) ?? useAuthStore((s) => s.role)`
- [ ] A linha `return <Redirect href="/(app)/(tabs)" />` usa
      `landingRouteForRole(role)`
- [ ] Os redirects para `/(auth)/sign-in` e `/onboarding` permanecem inalterados
- [ ] A tela de "Carregando..." (não hidratado / não carregado) permanece
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Logar como aluno → cai em Pendências. Logar como professor → cai em
Início.

**Commit**: `feat(mobile): redireciona aluno para Pendencias no boot do app`

---

### T4: Editar `app/(auth)/_layout.tsx` — redirect logado por papel [P]

**What**: Usuário já logado que abre uma rota de auth é roteado por papel.
**Where**: `apps/mobile/app/(auth)/_layout.tsx`
**Depends on**: T1
**Reuses**: `landingRouteForRole`, `useAuthStore`, `useOnboardingStore`
**Requirement**: SNR-03

**Done when**:
- [ ] A linha `if (completed) return <Redirect href="/(app)/(tabs)" />` usa
      `landingRouteForRole(role)`
- [ ] O redirect para `/onboarding` (quando `!completed`) permanece inalterado
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Estando logado como aluno, abrir manualmente `/(auth)/sign-in` →
redireciona para Pendências.

**Commit**: `feat(mobile): roteia usuario logado por papel no layout de auth`

---

### T5: Editar `app/(app)/onboarding.tsx` — conclusão roteia por papel [P]

**What**: Ao concluir o onboarding, o aluno vai para Pendências.
**Where**: `apps/mobile/app/(app)/onboarding.tsx`
**Depends on**: T1
**Reuses**: `landingRouteForRole`
**Requirement**: SNR-04

**Done when**:
- [ ] Em `handleRoleSelect`, `router.replace('/(app)/(tabs)')` usa
      `landingRouteForRole(role)` com o `role` recém-escolhido (parâmetro da função)
- [ ] No `useEffect` de `completed`, `router.replace('/(app)/(tabs)')` usa
      `landingRouteForRole` lendo o papel da store
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Conta nova → onboarding → escolher "Sou Aluno" → cai em Pendências.
Escolher "Sou Professor" → cai em Início.

**Commit**: `feat(mobile): conclusao do onboarding roteia aluno para Pendencias`

---

### T6: Editar `app/invite/[token].tsx` — pós-ingresso roteia por papel [P]

**What**: Após ingressar via deep link, o aluno é roteado para Pendências.
**Where**: `apps/mobile/app/invite/[token].tsx`
**Depends on**: T1
**Reuses**: `landingRouteForRole`, `useAuthStore`, `useOnboardingStore`
**Requirement**: SNR-05

**Done when**:
- [ ] Os dois `router.replace('/(app)/(tabs)')` (estados `success` e `error`)
      usam `landingRouteForRole(role)`
- [ ] O rótulo do botão de sucesso muda de "Ver minhas salas" para "Continuar"
- [ ] O redirect para `/(auth)/sign-in` (não logado) permanece inalterado
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Como aluno logado, abrir um link `invite/<token>` válido → após o
sucesso, o botão "Continuar" leva a Pendências.

**Commit**: `feat(mobile): pos-ingresso por convite roteia por papel`

---

### T7: Editar `app/(app)/(tabs)/_layout.tsx` — abas do aluno [P]

**What**: Ocultar a aba `index` para alunos e reordenar para Pendências primeiro.
**Where**: `apps/mobile/app/(app)/(tabs)/_layout.tsx`
**Depends on**: Nenhuma
**Reuses**: `role` já calculado no arquivo (`onboardingRole ?? authRole`)
**Requirement**: SNR-06

**Done when**:
- [ ] A `<Tabs.Screen name="index">` recebe `href: role === 'student' ? null : undefined`
- [ ] A ordem de declaração dos `<Tabs.Screen>` é: `index`, `pendencias`,
      `results`, `profile`
- [ ] Aluno vê 3 abas na ordem `Pendências`, `Resultados`, `Perfil`
- [ ] Professor vê 3 abas na ordem `Início`, `Pendências`, `Perfil`
- [ ] `tabBarAccessibilityLabel` de cada aba permanece definido
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Logar como aluno → 3 abas, Pendências à esquerda. Logar como
professor → 3 abas, Início à esquerda.

**Commit**: `feat(mobile): oculta aba Inicio para aluno e reordena abas`

---

### T8: Editar `app/(app)/(tabs)/index.tsx` — redirecionar aluno, remover StudentHome

**What**: `HomeScreen` redireciona alunos para Pendências; remover o código de
aluno (`StudentHome`, `StudentClassroomCard`, `extractToken`).
**Where**: `apps/mobile/app/(app)/(tabs)/index.tsx`
**Depends on**: T1, T2
**Reuses**: `Redirect` de `expo-router`; `TeacherHome` permanece intacto
**Requirement**: SNR-07

**Done when**:
- [ ] `HomeScreen`: para `role` de aluno, retorna `<Redirect href="/(app)/(tabs)/pendencias" />`
- [ ] `HomeScreen`: para professor, continua retornando `<TeacherHome ... />`
- [ ] Componentes `StudentHome` e `StudentClassroomCard` e helper `extractToken`
      removidos do arquivo
- [ ] Imports que ficaram sem uso após a remoção são eliminados
- [ ] `TeacherHome` e seu comportamento permanecem inalterados
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Logar como aluno → nunca vê a tela "Olá, ...!/Minhas Turmas"; sempre
Pendências. Logar como professor → tela Início normal.

**Commit**: `refactor(mobile): remove StudentHome e redireciona aluno para Pendencias`

---

### T9: Editar `app/(app)/(tabs)/pendencias.tsx` — botão "+", folha e CTA do vazio

**What**: Adicionar o botão "+" no cabeçalho (somente aluno), conectar a
`JoinClassroomSheet` e o CTA de ingressar no estado vazio.
**Where**: `apps/mobile/app/(app)/(tabs)/pendencias.tsx`
**Depends on**: T2
**Reuses**: `JoinClassroomSheet`, `useColors`, `useScale`, `EmptyState` (ou
botão inline no padrão do arquivo)
**Requirement**: SNR-09, SNR-10

**Done when**:
- [ ] `PendenciasTab` mantém estado `showJoin` e renderiza
      `<JoinClassroomSheet visible={showJoin} onClose={...} onJoined={...} />`
- [ ] O cabeçalho exibe um botão "+" **somente quando `role !== 'teacher'`**,
      com `accessibilityLabel="Entrar em uma turma"`, `accessibilityRole="button"`
      e `accessibilityHint`
- [ ] Ao receber `onJoined`, exibe um banner de sucesso com
      `accessibilityLiveRegion="polite"`
- [ ] `StudentPendencias` recebe `onOpenJoin` e, no estado vazio, exibe um botão
      "Entrar em uma turma" que chama `onOpenJoin`
- [ ] Texto/cores via `useScale()` / `useColors()`
- [ ] O comportamento atual de `TeacherPendencias` permanece inalterado
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Como aluno, tela de Pendências mostra o "+"; tocar abre a folha;
ingressar com convite válido fecha a folha, recarrega a lista e mostra o banner.
Aluno sem turma vê o CTA no estado vazio. Como professor, o "+" não aparece.

**Commit**: `feat(mobile): adiciona ingresso em turma na tela de Pendencias`

---

### T10: Editar `lib/voiceCommandDispatcher.ts` — navegação de voz por papel [P]

**What**: Os comandos de voz `GO_HOME` e "turmas" passam a rotear por papel.
**Where**: `apps/mobile/lib/voiceCommandDispatcher.ts`
**Depends on**: T1
**Reuses**: `landingRouteForRole`, `useAuthStore`, `useOnboardingStore`
**Requirement**: SNR-11

**Done when**:
- [ ] O handler do padrão `início|inicio|home|tela inicial` usa
      `router.push(landingRouteForRole(role))` com o papel lido das stores
- [ ] O handler do padrão "turmas" usa `landingRouteForRole(role)` e o `speak`
      é neutro (ex.: "Indo para o início.")
- [ ] O case `GO_HOME` em `postProcessAI` também usa `landingRouteForRole(role)`
- [ ] Comportamento do professor é preservado (aluno → Pendências; professor → Início)
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Aluno logado → assistente de voz → "início" leva a Pendências.
Professor → "início" leva a Início.

**Commit**: `feat(mobile): comandos de voz de navegacao roteiam por papel`

---

### T11: Editar `app/(app)/(tabs)/pendencias.tsx` — handlers de voz

**What**: A tela de Pendências passa a tratar os comandos de voz `OPEN_JOIN_MODAL`
e `NAVIGATE_TO_SUBJECT`.
**Where**: `apps/mobile/app/(app)/(tabs)/pendencias.tsx`
**Depends on**: T9, T10
**Reuses**: `useVoiceCommandStore` (`lastCommand`), `normalizeStr` de
`lib/normalize.ts`, `speak` de `lib/tts.ts`
**Requirement**: SNR-12, SNR-13

**Done when**:
- [ ] `useEffect` reage a `lastCommand`: `OPEN_JOIN_MODAL` → abre a folha (`setShowJoin(true)`)
- [ ] `StudentPendencias` mantém um `ref` do `ScrollView` e captura, via
      `onLayout` de cada seção de matéria, o offset `y` por `subjectId`
- [ ] `lastCommand === 'NAVIGATE_TO_SUBJECT'` com `payload.name`: casa o nome
      (via `normalizeStr`) com uma seção e faz `scrollTo({ y })`
- [ ] Matéria não encontrada → `speak("Não encontrei a matéria ...")`
- [ ] Nenhum caminho de voz do aluno navega para `/subject/[id]` ou
      `/student/classroom/[id]`
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Aluno → voz "ingressar em turma" abre a folha; voz "mostrar matéria
<nome>" rola a lista até a seção; nome inexistente → áudio de não encontrado.

**Commit**: `feat(mobile): trata comandos de voz de ingresso e materia em Pendencias`

---

### T12: Editar `respond/[id]/{text,oral,audio}.tsx` — voltar para Pendências [P]

**What**: O botão pós-envio das telas de resposta deixa de navegar para
`/subject/[id]` e passa a ir para a tela de Pendências.
**Where**:
- `apps/mobile/app/(app)/respond/[id]/text.tsx` (linha ~151)
- `apps/mobile/app/(app)/respond/[id]/oral.tsx` (linha ~209)
- `apps/mobile/app/(app)/respond/[id]/audio.tsx` (linha ~233)
**Depends on**: Nenhuma
**Reuses**: `router.replace`
**Requirement**: SNR-14

**Done when**:
- [ ] Nos 3 arquivos, o `onPress` que fazia
      `router.replace(\`/subject/${exam.subjectId}\`)` passa a
      `router.replace('/(app)/(tabs)/pendencias')`
- [ ] A ramificação `: router.back()` pode ser removida (destino agora é único)
- [ ] `grep -rn "/subject/" apps/mobile/app/(app)/respond` → 0 resultados
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: Como aluno, responder e enviar uma atividade em cada formato →
após enviar, a tela volta para Pendências.

**Commit**: `refactor(mobile): telas de resposta voltam para Pendencias apos envio`

---

### T13: Remover telas órfãs de turma/matéria

**What**: Excluir as rotas de browsing por turma e por matéria do aluno.
**Where**:
- `apps/mobile/app/(app)/student/classroom/[id].tsx` (remover)
- `apps/mobile/app/(app)/subject/[id].tsx` (remover)
**Depends on**: T8, T12
**Reuses**: —
**Requirement**: SNR-14

**Done when**:
- [ ] Os dois arquivos são removidos (e a pasta `student/classroom/` se ficar vazia)
- [ ] `grep -rn "/subject/\|student/classroom" apps/mobile/app apps/mobile/lib apps/mobile/components apps/mobile/hooks`
      não retorna referência de navegação do aluno (matches de rotas de
      professor `teacher/classroom/.../subject/...` são aceitáveis)
- [ ] O fluxo de atividade segue: `pendencias.tsx` → `/activity/[id]` funciona
- [ ] `npx tsc --noEmit` → 0 erros

**Verify**: `npx tsc --noEmit` passa; abrir uma atividade a partir de Pendências
e voltar não quebra.

**Commit**: `refactor(mobile): remove telas orfas de turma e materia do aluno`

---

### T14: Verificação final — type check e smoke test [sequencial]

**What**: Type check completo e validação ponta a ponta do fluxo do aluno.
**Where**: `apps/mobile/`
**Depends on**: T1–T13
**Requirement**: todos (SNR-01 … SNR-14)

**Done when**:
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] Aluno faz login → cai em Pendências; barra com 3 abas (Pendências,
      Resultados, Perfil), Pendências à esquerda e ativa
- [ ] Professor faz login → cai em Início; 3 abas (Início, Pendências, Perfil)
- [ ] Aluno sem turma → estado vazio de Pendências mostra "Entrar em uma turma"
- [ ] Botão "+" → folha → convite válido → ingressa, lista recarrega, sucesso anunciado
- [ ] Onboarding de aluno novo → "Sou Aluno" → cai em Pendências
- [ ] Deep link de convite deslogado → login → ingressa → cai em Pendências
- [ ] Voz: "início" leva o aluno a Pendências; "ingressar em turma" abre a folha;
      "mostrar matéria X" rola até a seção
- [ ] Responder atividade → após enviar, volta para Pendências
- [ ] `VoiceAssistantButton` e wake word continuam funcionando nas telas do aluno

**Verify**: Backend rodando (`dotnet run` em `apps/backend`), `.env` do mobile
com `EXPO_PUBLIC_API_URL`, `pnpm mobile` na raiz. Percorrer a checklist acima.

**Commit**: `chore(mobile): type check e smoke test da refatoracao de navegacao`

---

## Parallel Execution Map

```
Phase 1 (paralelo — fundação):
  T1 [P] lib/routes.ts
  T2 [P] components/student/JoinClassroomSheet.tsx
  T7 [P] (tabs)/_layout.tsx        (independente — pode iniciar aqui)

Phase 2 (paralelo — após T1):
  ├── T3 [P] app/index.tsx
  ├── T4 [P] app/(auth)/_layout.tsx
  ├── T5 [P] app/(app)/onboarding.tsx
  └── T6 [P] app/invite/[token].tsx

Phase 3 (após Phase 1):
  T8  (tabs)/index.tsx       (após T1, T2)
  T9  (tabs)/pendencias.tsx  (após T2)

Phase 4 (após T1, T9):
  T10 [P] voiceCommandDispatcher.ts   (após T1)
  T11     pendencias.tsx — voz         (após T9, T10)

Phase 5 (limpeza):
  T12 [P] respond/[id]/{text,oral,audio}.tsx
  T13     remover telas órfãs           (após T8, T12)

Phase 6 (sequencial):
  T14 verificação final                 (após T1–T13)
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: `lib/routes.ts` | 1 função pura | ✅ Granular |
| T2: `JoinClassroomSheet` | 1 componente | ✅ Granular |
| T3: `app/index.tsx` | 1 mudança de redirect | ✅ Granular |
| T4: `(auth)/_layout.tsx` | 1 mudança de redirect | ✅ Granular |
| T5: `onboarding.tsx` | 2 redirects coesos, mesmo arquivo | ✅ Granular |
| T6: `invite/[token].tsx` | 2 redirects + 1 label, mesmo arquivo | ✅ Granular |
| T7: `(tabs)/_layout.tsx` | 1 mudança (abas) | ✅ Granular |
| T8: `(tabs)/index.tsx` | 1 redirect + remoção coesa | ✅ Granular |
| T9: `pendencias.tsx` (ingresso) | 1 feature na tela | ✅ Granular |
| T10: `voiceCommandDispatcher.ts` | 1 mudança (rota por papel) | ✅ Granular |
| T11: `pendencias.tsx` (voz) | 1 feature (handlers de voz) | ✅ Granular |
| T12: `respond/[id]/*` | 3 arquivos, 1 mudança idêntica | ✅ Granular |
| T13: remover telas órfãs | 2 arquivos removidos | ✅ Granular |
| T14: verificação final | smoke test | ✅ Granular |

---

## Tools

Nenhuma tarefa requer MCP ou Skill especial. Ferramentas padrão de edição de
arquivo e `npx tsc --noEmit` para verificação. Commits atômicos, um por tarefa.
