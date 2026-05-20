# Student Navigation Refactor — Specification

## Problem Statement

O app é focado em acessibilidade e o aluno-alvo precisa da navegação mais curta
possível. Hoje o aluno entra na tela **Início**, que apenas lista turmas, e
precisa percorrer `Início → turma → matéria → atividade` para fazer qualquer
coisa — retrabalho de navegação que penaliza justamente quem tem necessidades
sensoriais ou motoras.

Esta refatoração faz o aluno ser **recebido diretamente pela tela de Pendências**
(que já agrega todas as atividades pendentes de todas as turmas, agrupadas por
matéria) e **elimina o conceito de "trocar de turma"**: turma e matéria passam a
ser apenas rótulos das seções da lista. A aba **Início** deixa de existir para o
aluno. O resultado: o aluno abre o app e já vê o que precisa fazer, sem navegar.
O fluxo do professor não é afetado.

## Goals

- [ ] Aluno é recebido pela tela de Pendências em 100% dos pontos de entrada
      (login, onboarding, deep link de convite, retomada de sessão)
- [ ] Aluno navega com no máximo 3 abas (Pendências, Resultados, Perfil), sem
      tela intermediária de turmas/matérias
- [ ] Aluno consegue ingressar em uma nova turma sem a aba Início, a partir da
      própria tela de Pendências
- [ ] Nenhuma funcionalidade de acessibilidade existente regride (voz, TTS,
      escala de fonte, alto contraste, leitor de tela)

## Out of Scope

| Feature | Razão |
|---|---|
| Seletor visual de turma/matéria (dropdown, chips, drawer) | Decisão do usuário: opção de lista achatada sem troca explícita |
| Alterar o endpoint `GET /activities/my-status` ou qualquer backend | Refatoração é puramente de navegação no mobile |
| Mudança no fluxo do professor (abas, Home, navegação) | Professor mantém Início, Pendências, Perfil inalterados |
| Filtrar pendências por turma ou matéria | Opção 3 elimina o conceito de troca; lista é única e completa |
| Tela de revisão de atividades já concluídas por matéria | Coberto pela aba Resultados; browser por matéria deixa de existir |
| Wake word / assistente de voz global (`VoiceAssistantButton`) | Permanece como está; apenas rotas de comandos são ajustadas |

---

## User Stories

### SNR-P1: Aluno é recebido pela tela de Pendências ⭐ MVP

**User Story**: Como aluno, quero abrir o app e já ver minhas atividades
pendentes, para não precisar navegar por turmas e matérias antes de começar.

**Why P1**: É o cerne da refatoração. Sem isso, o retrabalho de navegação que
motiva o projeto continua existindo.

**Acceptance Criteria**:

1. WHEN um aluno conclui o login THEN o sistema SHALL exibir a tela de Pendências
   como primeira tela
2. WHEN um aluno conclui o onboarding (escolhe "Sou Aluno") THEN o sistema SHALL
   navegar para a tela de Pendências
3. WHEN um aluno já logado reabre o app THEN o sistema SHALL restaurar a sessão
   direto na tela de Pendências
4. WHEN um aluno entra por deep link de convite e o ingresso é concluído THEN o
   sistema SHALL roteá-lo para a tela de Pendências
5. WHEN um professor faz login THEN o sistema SHALL continuar exibindo a tela
   Início (comportamento atual inalterado)
6. WHEN qualquer navegação leva um aluno à rota índice oculta `(tabs)/index`
   THEN o sistema SHALL redirecioná-lo automaticamente para Pendências

**Independent Test**: Logar como aluno → a primeira tela visível é "Pendências"
com a aba homônima ativa. Logar como professor → a primeira tela é "Início".

---

### SNR-P1: Barra de abas enxuta do aluno ⭐ MVP

**User Story**: Como aluno, quero uma barra de abas curta e sem itens
redundantes, para encontrar o que preciso com menos opções.

**Why P1**: A aba Início perde a função com a lista achatada; mantê-la seria um
caminho morto que contraria o objetivo de simplicidade.

**Acceptance Criteria**:

1. WHEN um aluno abre o app THEN a bottom nav SHALL exibir exatamente 3 abas:
   `Pendências`, `Resultados`, `Perfil`, nesta ordem da esquerda para a direita
2. WHEN um aluno está na bottom nav THEN a aba `Pendências` SHALL ser a primeira
   (à esquerda) e a ativa por padrão
3. WHEN um professor abre o app THEN a bottom nav SHALL exibir `Início`,
   `Pendências`, `Perfil` (aba `Resultados` permanece oculta para professor)
4. WHEN a aba `Início` está oculta para o aluno THEN ela NÃO SHALL ser
   alcançável pela barra de abas

**Independent Test**: Logar como aluno → contar 3 abas na ordem Pendências,
Resultados, Perfil. Logar como professor → contar 3 abas Início, Pendências,
Perfil.

---

### SNR-P1: Ingressar em turma a partir de Pendências ⭐ MVP

**User Story**: Como aluno, quero ingressar em uma nova turma diretamente da tela
de Pendências, já que não existe mais a aba Início onde isso ficava.

**Why P1**: Sem um novo lar para a ação de ingressar, um aluno sem turmas ficaria
sem como entrar em nenhuma — bloqueio total do app.

**Acceptance Criteria**:

1. WHEN um aluno está na tela de Pendências THEN o cabeçalho SHALL exibir um
   botão "+" com `accessibilityLabel="Entrar em uma turma"`
2. WHEN o usuário tem role = `teacher` THEN o botão "+" NÃO SHALL aparecer no
   cabeçalho de Pendências
3. WHEN um aluno toca o botão "+" THEN o sistema SHALL abrir a folha de ingressar
   em turma (bottom sheet)
4. WHEN um aluno cola um link/código de convite válido e confirma THEN o sistema
   SHALL ingressar na turma, fechar a folha, atualizar a lista de pendências e
   anunciar o sucesso via `accessibilityLiveRegion`
5. WHEN um aluno não está em nenhuma turma THEN o estado vazio da tela de
   Pendências SHALL exibir um botão "Entrar em uma turma" que abre a mesma folha
6. WHEN o convite é inválido ou expirado THEN a folha SHALL exibir mensagem de
   erro sem fechar
7. WHEN o aluno já faz parte da turma do convite THEN a folha SHALL exibir
   "Você já faz parte desta turma."

**Independent Test**: Logar como aluno → tela de Pendências → tocar "+" → colar
convite válido → folha fecha, turma aparece, mensagem de sucesso é anunciada.

---

### SNR-P2: Comandos de voz cientes do novo fluxo

**User Story**: Como aluno que usa o assistente de voz, quero que os comandos de
navegação reflitam o novo fluxo, para continuar navegando sem as mãos.

**Why P2**: Não bloqueia o MVP (a rede de segurança de redirect cobre o caso),
mas sem isso a experiência de voz fica inconsistente com a UI.

**Acceptance Criteria**:

1. WHEN um aluno diz "início" / "home" / "tela inicial" THEN o assistente SHALL
   navegar para a tela de Pendências
2. WHEN um aluno diz "ingressar em turma" / "entrar em turma" THEN o sistema
   SHALL abrir a folha de ingressar na tela de Pendências
3. WHEN um aluno diz "mostrar matéria X" e a matéria X está na lista de
   pendências THEN a tela SHALL rolar até a seção daquela matéria
4. WHEN a matéria pedida não está na lista THEN o assistente SHALL falar uma
   mensagem de "não encontrei a matéria X"
5. WHEN um professor diz "início" THEN o assistente SHALL continuar navegando
   para a tela Início (comportamento por papel)

**Independent Test**: Com aluno logado, ativar o assistente e dizer "início" →
foco vai para Pendências; dizer "mostrar matéria <nome>" → a lista rola até a
seção da matéria.

---

### SNR-P3: Remoção das telas órfãs de navegação por turma/matéria

**User Story**: Como mantenedor do código, quero remover as telas de browsing por
turma e matéria que ficaram sem ponto de entrada, para não deixar caminho morto.

**Why P3**: É higiene de código; não afeta o usuário final diretamente, mas
fecha o ciclo da refatoração e evita rotas inalcançáveis.

**Acceptance Criteria**:

1. WHEN a refatoração está completa THEN as rotas `app/(app)/student/classroom/[id].tsx`
   e `app/(app)/subject/[id].tsx` SHALL ser removidas
2. WHEN um aluno envia uma resposta em `respond/[id]/{text,oral,audio}.tsx` THEN
   o sistema SHALL roteá-lo de volta para a tela de Pendências (não mais para
   `/subject/[id]`)
3. WHEN o app é compilado THEN NÃO SHALL existir nenhuma referência às rotas
   removidas

**Independent Test**: `grep -rn "/subject/\|student/classroom" apps/mobile/app`
não retorna nenhuma referência de navegação do aluno; `npx tsc --noEmit` passa.

---

## Edge Cases

- WHEN um aluno não tem turmas nem pendências THEN a tela de Pendências SHALL
  exibir o estado vazio com o botão "Entrar em uma turma" (não uma tela em branco)
- WHEN um aluno tem pendências em várias turmas THEN a lista SHALL exibir todas
  agrupadas por matéria, com o nome da turma como rótulo de cada seção
- WHEN `GET /activities/my-status` falha THEN a tela SHALL exibir o estado de erro
  já existente em `StudentPendencias`
- WHEN um professor navega manualmente para `/(app)/(tabs)` THEN ele SHALL cair
  na tela Início normalmente (a regra de redirect é só para `student`)
- WHEN um aluno diz por voz "ir para turma X" (comando sem destino no novo fluxo)
  THEN o sistema SHALL tratar como no-op silencioso ou rolar até a matéria, sem
  navegar para rota inexistente nem quebrar
- WHEN o onboarding chama o roteamento logo após o aluno escolher o papel THEN a
  rota SHALL usar o papel recém-escolhido (não depender de propagação na store)
- WHEN a sessão não está hidratada/carregada THEN a tela de carregamento atual
  SHALL ser mantida antes de qualquer redirect

---

## Arquivos Afetados

### Mobile (novo)
| Arquivo | Ação |
|---|---|
| `apps/mobile/lib/routes.ts` | Criar — helper `landingRouteForRole(role)` |
| `apps/mobile/components/student/JoinClassroomSheet.tsx` | Criar — folha de ingressar reutilizável |

### Mobile (editar)
| Arquivo | Mudança |
|---|---|
| `apps/mobile/app/index.tsx` | Redirect inicial por papel |
| `apps/mobile/app/(auth)/_layout.tsx` | Redirect de usuário logado por papel |
| `apps/mobile/app/(app)/onboarding.tsx` | Pós-onboarding roteia aluno p/ Pendências |
| `apps/mobile/app/invite/[token].tsx` | Pós-ingresso roteia por papel |
| `apps/mobile/app/(app)/(tabs)/_layout.tsx` | Oculta aba `index` p/ aluno; reordena abas |
| `apps/mobile/app/(app)/(tabs)/index.tsx` | Aluno é redirecionado; remove `StudentHome` |
| `apps/mobile/app/(app)/(tabs)/pendencias.tsx` | Botão "+", folha de ingressar, CTA no vazio, voz |
| `apps/mobile/lib/voiceCommandDispatcher.ts` | `GO_HOME` / "turmas" cientes do papel |
| `apps/mobile/app/(app)/respond/[id]/text.tsx` | Pós-envio volta p/ Pendências |
| `apps/mobile/app/(app)/respond/[id]/oral.tsx` | Pós-envio volta p/ Pendências |
| `apps/mobile/app/(app)/respond/[id]/audio.tsx` | Pós-envio volta p/ Pendências |

### Mobile (remover)
| Arquivo | Razão |
|---|---|
| `apps/mobile/app/(app)/student/classroom/[id].tsx` | Órfão — sem ponto de entrada do aluno |
| `apps/mobile/app/(app)/subject/[id].tsx` | Órfão — lista achatada substitui o browser por matéria |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| SNR-01 | SNR-P1: Pendências como tela inicial | Tasks | Pending |
| SNR-02 | SNR-P1: Pendências como tela inicial | Tasks | Pending |
| SNR-03 | SNR-P1: Pendências como tela inicial | Tasks | Pending |
| SNR-04 | SNR-P1: Pendências como tela inicial | Tasks | Pending |
| SNR-05 | SNR-P1: Pendências como tela inicial | Tasks | Pending |
| SNR-06 | SNR-P1: Barra de abas enxuta | Tasks | Pending |
| SNR-07 | SNR-P1: Pendências como tela inicial | Tasks | Pending |
| SNR-08 | SNR-P1: Ingressar em turma a partir de Pendências | Tasks | Pending |
| SNR-09 | SNR-P1: Ingressar em turma a partir de Pendências | Tasks | Pending |
| SNR-10 | SNR-P1: Ingressar em turma a partir de Pendências | Tasks | Pending |
| SNR-11 | SNR-P2: Comandos de voz | Tasks | Pending |
| SNR-12 | SNR-P2: Comandos de voz | Tasks | Pending |
| SNR-13 | SNR-P2: Comandos de voz | Tasks | Pending |
| SNR-14 | SNR-P3: Remoção das telas órfãs | Tasks | Pending |

**Detalhe dos IDs:**

| ID | Requisito |
|---|---|
| SNR-01 | Helper `landingRouteForRole` centraliza a regra de rota inicial por papel |
| SNR-02 | `app/index.tsx` redireciona aluno p/ Pendências, professor p/ Início |
| SNR-03 | `(auth)/_layout.tsx` redireciona usuário já logado por papel |
| SNR-04 | `onboarding.tsx` roteia aluno p/ Pendências ao concluir |
| SNR-05 | `invite/[token].tsx` roteia por papel após ingressar |
| SNR-06 | Aba `index` oculta p/ aluno; ordem das abas com Pendências primeiro |
| SNR-07 | `HomeScreen` redireciona aluno p/ Pendências (rede de segurança) + remove `StudentHome` |
| SNR-08 | `JoinClassroomSheet` — componente reutilizável de ingressar |
| SNR-09 | Botão "+" no cabeçalho de Pendências (somente aluno) abre a folha |
| SNR-10 | Estado vazio de Pendências oferece CTA "Entrar em uma turma" |
| SNR-11 | Voz: `GO_HOME` / "turmas" roteia por papel (aluno → Pendências) |
| SNR-12 | Voz: `OPEN_JOIN_MODAL` abre a folha de ingressar em Pendências |
| SNR-13 | Voz: "mostrar matéria X" rola até a seção da matéria |
| SNR-14 | Remoção das telas órfãs + desacoplamento das telas de resposta |

**Coverage:** 14 requisitos totais, 14 mapeados para tarefas, 0 não mapeados.

---

## Success Criteria

- [ ] Aluno faz login e a primeira tela é Pendências, sem passar por nenhuma
      tela de turma/matéria
- [ ] Aluno tem 3 abas; professor mantém suas 3 abas inalteradas
- [ ] Aluno sem turma consegue ingressar pela tela de Pendências (botão "+" ou
      CTA do estado vazio)
- [ ] `npx tsc --noEmit` em `apps/mobile` → 0 erros após a implementação completa
- [ ] `grep -rn "/subject/\|student/classroom" apps/mobile/app` não retorna
      referências de navegação do aluno
- [ ] Todo elemento tocável novo tem `accessibilityLabel`, `accessibilityRole` e,
      quando útil, `accessibilityHint`; textos usam `useScale()` e cores `useColors()`
- [ ] O `VoiceAssistantButton` global e a detecção de wake word continuam
      funcionando em todas as telas do aluno
