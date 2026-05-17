# Accessibility Polish Specification

## Problem Statement

O store de acessibilidade já persiste `highContrast`, `fontSizeScale`, `reducedMotion` e `defaultResponseFormat`, e a tela de perfil já expõe os controles. Porém o efeito visual dessas configurações só alcança duas telas (`activity/[id].tsx` e `attempt/[id].tsx`) com valores de cor hardcoded e funções locais. Todas as outras telas ignoram as preferências do usuário. Adicionalmente, emojis são usados como ícones de UI (estados vazios, erros, chips de formato) em vez da biblioteca Ionicons já presente no projeto.

## Goals

- [ ] Alto contraste aplicado em todas as telas do app (não apenas activity e attempt)
- [ ] Escalonamento de fonte aplicado em todas as telas
- [ ] Paleta de alto contraste centralizada em `lib/colors.ts` (sem valores hardcoded espalhados)
- [ ] Hooks `useColors` e `useScale` reutilizáveis para eliminar duplicação
- [ ] Emojis substituídos por Ionicons em todos os componentes de UI compartilhados
- [ ] Ícones de formato de resposta trocados de emoji para Ionicons em `FormatIcon`, `Chip` e `ActivityCard`

## Out of Scope

| Feature | Razão |
|---|---|
| TTS (Text-to-Speech) funcional | Requer integração de biblioteca nativa — fase posterior |
| Leitor de tela (screenReader) automático | Integração com VoiceOver/TalkBack é fase posterior |
| Temas customizáveis além de claro/escuro | Dois temas são suficientes para o hackathon |
| Animações com `LayoutAnimation` para `reducedMotion` | Complexity vs. ganho baixo no hackathon |
| Tela de teacher/new-activity e respond screens completas | Baixa prioridade visual; fora do fluxo principal do aluno |

---

## User Stories

### AP-01: Alto contraste em todas as telas ⭐ MVP

**User Story**: Como usuário com baixa visão, quero que o modo de alto contraste afete todas as telas do aplicativo, para ter uma experiência consistente de leitura.

**Acceptance Criteria**:

1. WHEN usuário ativa "Alto Contraste" no perfil THEN TODAS as telas SHALL exibir fundo preto, texto branco e bordas cinza escuro
2. WHEN usuário desativa "Alto Contraste" THEN app SHALL retornar ao tema claro em todas as telas imediatamente
3. WHEN usuário navega entre telas com alto contraste ativo THEN nenhuma tela SHALL exibir cores do tema claro (sem flash de branco)
4. WHEN alto contraste está ativo THEN botões de ação primária SHALL usar verde claro (#4ade80) legível sobre fundo preto

**Independent Test**: Ativar alto contraste → navegar por Home, Matéria, Atividade, Resultados, Perfil → todas as telas aparecem com fundo preto e texto branco.

---

### AP-02: Escalonamento de fonte em todas as telas ⭐ MVP

**User Story**: Como usuário com dificuldade de leitura, quero que o tamanho de fonte selecionado no perfil seja respeitado em todas as telas.

**Acceptance Criteria**:

1. WHEN usuário seleciona "A++" (escala 1.4) THEN todos os textos em TODAS as telas SHALL ser proporcionalmente maiores
2. WHEN usuário seleciona "A-" (escala 0.85) THEN textos SHALL ser menores proporcionalmente
3. WHEN escala é alterada THEN mudança SHALL ser aplicada imediatamente sem reiniciar o app
4. WHEN escala de fonte é aplicada THEN layout SHALL acomodar o texto maior sem cortar conteúdo

**Independent Test**: Selecionar A++ → percorrer todas as telas → todos os textos aparecem 40% maiores.

---

### AP-03: Ícones Ionicons em lugar de emojis ⭐ MVP

**User Story**: Como usuário, quero que os ícones do app sejam consistentes e nítidos em qualquer resolução de tela, em vez de emojis que variam por plataforma.

**Acceptance Criteria**:

1. WHEN usuário vê um estado vazio (nenhuma turma, nenhum resultado) THEN sistema SHALL exibir ícone Ionicons em vez de emoji
2. WHEN usuário vê um estado de erro THEN sistema SHALL exibir ícone Ionicons em vez de emoji
3. WHEN usuário vê chips de formato de resposta (Texto, Áudio, etc.) THEN sistema SHALL exibir ícone Ionicons correspondente
4. WHEN alto contraste está ativo THEN ícones Ionicons SHALL respeitar a cor do tema (cor de texto ou cor de destaque)

**Independent Test**: Navegar para uma turma vazia → estado vazio exibe Ionicons, não emoji. Chip "Texto" exibe ícone de lápis Ionicons.

---

## Edge Cases

- WHEN fonte em escala máxima (1.5) e texto longo THEN layout SHALL usar `numberOfLines` onde necessário para evitar overflow
- WHEN alto contraste ativo e formato de cor de status (success, error, warning) THEN versões de alto contraste SHALL ter contraste mínimo 4.5:1 sobre fundo preto
- WHEN `fontSizeScale` é 1.0 (padrão) THEN `scale(n)` SHALL retornar exatamente `n` sem arredondamentos indesejados

---

## Arquivos Afetados

### Mobile (novos)
| Arquivo | Descrição |
|---|---|
| `hooks/useColors.ts` | Retorna `colors` ou `highContrastColors` baseado no store |
| `hooks/useScale.ts` | Retorna função `scale(n)` baseada em `fontSizeScale` |

### Mobile (editar)
| Arquivo | Mudança |
|---|---|
| `lib/colors.ts` | Adicionar `highContrastColors`; trocar `formatIcons` de emojis para nomes Ionicons |
| `components/ui/EmptyState.tsx` | `icon: string` → `iconName: string` + render Ionicons |
| `components/ui/ErrorState.tsx` | Emoji → Ionicons |
| `components/ui/Chip.tsx` | `icon: string` → `iconName: string` + render Ionicons |
| `components/format/FormatIcon.tsx` | Emoji → Ionicons via `formatIcons` atualizado |
| `components/activity/ActivityCard.tsx` | Chips de formato → usar `formatIcons` (Ionicons) |
| `app/(app)/(tabs)/index.tsx` | Aplicar `useColors` + `useScale` |
| `app/(app)/(tabs)/results.tsx` | Aplicar `useColors` + `useScale` |
| `app/(app)/(tabs)/profile.tsx` | Aplicar `useColors` + `useScale` |
| `app/(app)/subject/[id].tsx` | Aplicar `useColors` + `useScale` |
| `app/(app)/activity/[id].tsx` | Substituir ternários inline pelos hooks |
| `app/(app)/attempt/[id].tsx` | Substituir ternários inline pelos hooks |
| `app/(app)/teacher/classroom/[id].tsx` | Aplicar `useColors` + `useScale` |
| `app/(app)/teacher/classroom/[id]/subject/[subjectId].tsx` | Aplicar `useColors` + `useScale` |

---

## Requirement Traceability

| Requirement ID | Story | Status |
|---|---|---|
| AP-01 | Alto contraste — paleta centralizada | Pending |
| AP-02 | Alto contraste — todas as telas | Pending |
| AP-03 | Escalonamento de fonte — todas as telas | Pending |
| AP-04 | Hooks reutilizáveis useColors + useScale | Pending |
| AP-05 | EmptyState e ErrorState com Ionicons | Pending |
| AP-06 | Chip com Ionicons | Pending |
| AP-07 | FormatIcon com Ionicons | Pending |
| AP-08 | Callers de EmptyState atualizados | Pending |

---

## Success Criteria

- [ ] Ativar alto contraste → todas as 10+ telas ficam com fundo preto e texto branco
- [ ] Selecionar A++ → textos em todas as telas crescem proporcionalmente
- [ ] Nenhum emoji visível como ícone de UI em nenhuma tela
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] Nenhum crash ao alternar alto contraste em qualquer tela
