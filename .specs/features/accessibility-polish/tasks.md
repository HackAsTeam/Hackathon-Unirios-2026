# Accessibility Polish — Tasks

**Design**: `.specs/features/accessibility-polish/design.md`
**Status**: Draft

---

## Task Breakdown

### T1: Paleta de alto contraste + formatIcons Ionicons (`lib/colors.ts`)

**What**: Centralizar os tokens de cor de alto contraste e substituir emojis de formato por nomes Ionicons
**Where**: `apps/mobile/lib/colors.ts`
**Depends on**: Nenhuma

**Done when**:
- [ ] `highContrastColors` exportado com a mesma shape de `colors`
- [ ] Todos os tokens de `highContrastColors` preenchidos conforme tabela no design.md
- [ ] `formatIcons` usa nomes Ionicons (ex: `"create-outline"`) em vez de emojis
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): paleta de alto contraste e ícones de formato como Ionicons`

---

### T2: Hooks `useColors` e `useScale`

**What**: Criar dois hooks reutilizáveis para tema e escala de fonte
**Where**: `apps/mobile/hooks/useColors.ts`, `apps/mobile/hooks/useScale.ts`
**Depends on**: T1

**Done when**:
- [ ] `useColors()` retorna `highContrastColors` quando `highContrast === true`, senão `colors`
- [ ] `useScale()` retorna `(base: number) => Math.round(base * fontSizeScale)`
- [ ] Ambos os hooks tipados corretamente (sem `any`)
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): hooks useColors e useScale para acessibilidade`

---

### T3: Componentes UI compartilhados — Ionicons

**What**: Substituir emoji por Ionicons em `EmptyState`, `ErrorState` e `Chip`
**Where**: `apps/mobile/components/ui/`
**Depends on**: Nenhuma (independente de T1/T2)

**Done when**:
- [ ] `EmptyState`: prop `icon?: string` → `iconName?: string`; renderiza `<Ionicons>` com cor `c.text.tertiary`; default `"file-tray-outline"`
- [ ] `ErrorState`: emoji `😕` → `<Ionicons name="alert-circle-outline" size={56} />`
- [ ] `Chip`: prop `icon?: string` → `iconName?: string`; renderiza `<Ionicons>` em vez de `<Text>`
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): substitui emojis por Ionicons em EmptyState, ErrorState e Chip`

---

### T4: `FormatIcon` e `ActivityCard` — Ionicons

**What**: Atualizar FormatIcon para renderizar Ionicons e ActivityCard para usar iconName nos chips
**Where**: `apps/mobile/components/format/FormatIcon.tsx`, `apps/mobile/components/activity/ActivityCard.tsx`
**Depends on**: T1 (formatIcons com nomes Ionicons), T3 (Chip atualizado)

**Done when**:
- [ ] `FormatIcon`: renderiza `<Ionicons name={formatIcons[format]}>` em vez de `<Text>{emoji}</Text>`
- [ ] `ActivityCard`: chips de formato usam `iconName={formatIcons[f]}` em vez de ternário de emojis
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): FormatIcon e chips de atividade usam Ionicons`

---

### T5: Telas do aluno — `useColors` + `useScale`

**What**: Aplicar hooks de acessibilidade nas telas principais do fluxo do aluno
**Where**:
- `apps/mobile/app/(app)/(tabs)/index.tsx`
- `apps/mobile/app/(app)/(tabs)/results.tsx`
- `apps/mobile/app/(app)/(tabs)/profile.tsx`
- `apps/mobile/app/(app)/subject/[id].tsx`
**Depends on**: T2, T3

**Done when**:
- [ ] `index.tsx` (StudentHome + StudentClassroomCard): todas as cores via `c.*`, todos os `fontSize` via `scale(n)`; `EmptyState` usa `iconName`
- [ ] `results.tsx`: todas as cores via `c.*`, todos os `fontSize` via `scale(n)`; `EmptyState` usa `iconName`
- [ ] `profile.tsx`: todas as cores via `c.*`, todos os `fontSize` via `scale(n)`
- [ ] `subject/[id].tsx`: todas as cores via `c.*`, todos os `fontSize` via `scale(n)`; empty state usa `iconName`
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): acessibilidade nas telas do aluno (alto contraste + escala de fonte)`

---

### T6: Telas `activity` e `attempt` — migrar para hooks

**What**: Substituir ternários e helpers locais pelos hooks centralizados
**Where**:
- `apps/mobile/app/(app)/activity/[id].tsx`
- `apps/mobile/app/(app)/attempt/[id].tsx`
**Depends on**: T2

**Done when**:
- [ ] `activity/[id].tsx`: remove `const bg = highContrast ? ... : ...` e helper local `scale()`; usa `useColors()` e `useScale()`
- [ ] `attempt/[id].tsx`: remove ternários inline de cor e helper local `scale()`; usa `useColors()` e `useScale()`
- [ ] Comportamento visual idêntico ao anterior
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `refactor(mobile): activity e attempt migram para hooks useColors/useScale`

---

### T7: Telas do professor — `useColors` + `useScale`

**What**: Aplicar hooks nas telas do professor
**Where**:
- `apps/mobile/app/(app)/teacher/classroom/[id].tsx`
- `apps/mobile/app/(app)/teacher/classroom/[id]/subject/[subjectId].tsx`
**Depends on**: T2, T3

**Done when**:
- [ ] `classroom/[id].tsx`: cores via `c.*`, fontSizes via `scale(n)`, empty state usa `iconName`
- [ ] `subject/[subjectId].tsx`: cores via `c.*`, fontSizes via `scale(n)`, empty state usa `iconName`
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): acessibilidade nas telas do professor (alto contraste + escala de fonte)`

---

### T8: Verificação final

**Done when**:
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] Alto contraste ativo → todas as telas com fundo preto e texto branco
- [ ] Escala A++ → textos maiores em todas as telas
- [ ] Nenhum emoji visível como ícone de UI em nenhuma tela
- [ ] Nenhum crash ao alternar alto contraste ou escala com qualquer tela aberta

**Commit**: `chore: type check accessibility-polish`

---

## Status

| Task | Status |
|---|---|
| T1: Paleta highContrastColors + formatIcons Ionicons | Pending |
| T2: Hooks useColors + useScale | Pending |
| T3: EmptyState, ErrorState, Chip — Ionicons | Pending |
| T4: FormatIcon + ActivityCard — Ionicons | Pending |
| T5: Telas do aluno | Pending |
| T6: activity + attempt — migrar para hooks | Pending |
| T7: Telas do professor | Pending |
| T8: Verificação final | Pending |
