# Voice Activity Navigation — Specification

## Problem Statement

O `student-navigation-refactor` (recém-entregue) mudou o fluxo do aluno: ele
agora é recebido pela tela **Pendências**, uma lista achatada de atividades
agrupadas por matéria — sem mais telas de navegação por turma/matéria. Mas o
**sistema de navegação por voz não foi adaptado**. O app é focado em
acessibilidade e, hoje, um aluno com deficiência visual **não consegue chegar a
uma atividade usando a voz**.

Esta feature torna o assistente de voz ciente do novo fluxo. O aluno passa a
poder:

1. **"Entre na atividade de matemática"** — resolver `matemática` como **matéria**
   e abrir a atividade. Se a matéria tem várias atividades, o app lê a lista e
   aguarda o aluno dizer qual.
2. **"Abrir atividade \<título\>"** — resolver pelo **título** e abrir.
3. **"Listar pendências"** — navegar para Pendências **e ler a lista em voz alta**.

Também corrige duas regressões deixadas pelo refactor anterior:

- `NAVIGATE_TO_SUBJECT` ("entra na matéria X") apenas fala — nunca rola até a
  seção (o `design.md` do refactor previa scroll-to-section; a tarefa T11
  entregou só o `speak`).
- `NAVIGATE_TO_CLASSROOM` ("entra na turma X") virou **comando morto para o
  aluno** — seu handler vivia em `StudentHome`, removido pela tarefa T8.

O fluxo do professor não é afetado.

## Goals

- [ ] Aluno abre uma atividade por voz referenciando a **matéria** (a primeira
      disponível, ou desambiguação se houver várias)
- [ ] Aluno abre uma atividade por voz referenciando o **título**
- [ ] Quando há ambiguidade, o app **lê a lista de candidatas e aguarda** a
      escolha do aluno (sem travar o assistente)
- [ ] "Listar pendências" navega para Pendências **e** lê a lista agrupada por
      matéria (com filtro opcional por matéria)
- [ ] O backend de IA reconhece a intenção de navegar para uma atividade
      (`NAVIGATE_TO_ACTIVITY`) como fallback para frases livres
- [ ] Os comandos de voz órfãos do refactor anterior são corrigidos
- [ ] Nenhuma funcionalidade de acessibilidade existente regride (wake word,
      `VoiceAssistantButton`, TTS, escala de fonte, alto contraste)
- [ ] O fluxo de voz do professor permanece inalterado

## Out of Scope

| Item | Razão |
|---|---|
| Responder a atividade por voz (`READ_ALOUD`, `NEXT_QUESTION`, `SUBMIT_ANSWER`…) | Já existe nas telas `respond/[id]/*` e `activity/[id]`; sem mudança |
| Wake word / `VoiceAssistantButton` | Permanecem como estão; só o roteamento de comandos muda |
| Lookup server-side de atividade (resolver nome → ID no backend) | O cliente já tem todos os dados em cache; resolução é client-side |
| Telas de browsing por turma/matéria | Removidas no refactor anterior; não retornam |
| Mudança no fluxo de voz do professor | Professor mantém `NAVIGATE_TO_CLASSROOM`, `CREATE_*` etc. inalterados |
| Menu visual de desambiguação | A desambiguação é por voz (ler lista + aguardar); sem UI nova |

---

## User Stories

### VAN-P1: Abrir atividade por matéria via voz ⭐ MVP

**User Story**: Como aluno com deficiência visual, quero dizer "entre na atividade
de matemática" e ser levado à atividade de matemática, para começar a estudar sem
navegar pela tela.

**Why P1**: É o exemplo central pedido. Sem isso, o aluno-alvo não alcança
nenhuma atividade por voz.

**Acceptance Criteria**:

1. WHEN o aluno diz "entre/entrar/abrir/ir para a atividade de \<X\>" e exatamente
   **uma** atividade da matéria \<X\> está disponível THEN o sistema SHALL abrir
   `/(app)/activity/[id]` dessa atividade e anunciar o título via TTS
2. WHEN \<X\> casa com uma matéria que tem **várias** atividades THEN o sistema
   SHALL acionar a história de desambiguação (VAN-P1: Desambiguação)
3. WHEN \<X\> não casa com nenhuma matéria nem título THEN o sistema SHALL falar
   "Não encontrei a atividade \<X\>." e NÃO SHALL navegar
4. WHEN o comando é dado a partir de qualquer aba (Pendências, Resultados, Perfil)
   THEN a navegação SHALL funcionar (a resolução acontece no dispatcher, não na
   tela montada)
5. WHEN a cache de atividades não está carregada THEN o resolver SHALL buscar
   `GET /activities/my-status` antes de resolver

**Independent Test**: Aluno logado com 1 atividade de Matemática → dizer "entre na
atividade de matemática" → a tela de atividade abre e o título é falado.

---

### VAN-P1: Abrir atividade por título via voz ⭐ MVP

**User Story**: Como aluno, quero dizer o nome da atividade ("abrir atividade
prova de frações") e ser levado a ela, para chegar direto ao que o professor pediu.

**Why P1**: É o segundo modo de acesso pedido explicitamente; cobre o caso em que
o aluno sabe o nome exato.

**Acceptance Criteria**:

1. WHEN o aluno diz "abrir/entrar na atividade \<título\>" e exatamente **um**
   título casa THEN o sistema SHALL abrir essa atividade e anunciar o título
2. WHEN o termo falado casa com **vários** títulos THEN o sistema SHALL acionar a
   desambiguação
3. WHEN o termo casa tanto com um título quanto com uma matéria THEN o sistema
   SHALL priorizar o casamento por **título** quando houver título único
4. WHEN nenhum título casa THEN o sistema SHALL tentar resolver como matéria
   antes de declarar "não encontrei"

**Independent Test**: Aluno com atividade "Prova de Frações" → dizer "abrir
atividade prova de frações" → a atividade abre.

---

### VAN-P1: Desambiguação — ler a lista e aguardar a escolha ⭐ MVP

**User Story**: Como aluno, quando minha frase casa com várias atividades, quero
ouvir as opções e escolher dizendo o título, para não ser levado à atividade errada.

**Why P1**: É a decisão do usuário para o caso ambíguo. Sem ela, "atividade de
matemática" com 3 atividades seria imprevisível.

**Acceptance Criteria**:

1. WHEN a resolução retorna mais de uma candidata THEN o sistema SHALL falar a
   lista das candidatas (título por título) e uma instrução ("Diga o título da
   atividade.")
2. WHEN a lista é falada THEN a resposta SHALL ter `type: 'CONFIRM'` para que o
   overlay de voz **volte a escutar** automaticamente
3. WHEN a lista é falada THEN o sistema SHALL guardar as candidatas em
   `pendingActivityPick` no store de voz
4. WHEN `pendingActivityPick` está ativo e o aluno fala um título de candidata
   (ou um ordinal: "a primeira", "a segunda") THEN o sistema SHALL abrir a
   atividade correspondente e limpar `pendingActivityPick`
5. WHEN `pendingActivityPick` está ativo e o aluno diz "cancelar" THEN o sistema
   SHALL limpar a escolha pendente e confirmar por voz
6. WHEN `pendingActivityPick` está ativo e a fala não casa com nenhuma candidata
   nem com "cancelar" THEN o sistema SHALL limpar a escolha pendente e processar a
   fala normalmente (NÃO SHALL prender o aluno no estado de escolha)

**Independent Test**: Aluno com 3 atividades de Matemática → "atividade de
matemática" → ouve as 3 → diz o título de uma → ela abre.

---

### VAN-P1: "Listar pendências" navega e lê a lista ⭐ MVP

**User Story**: Como aluno, quero dizer "listar pendências" e ouvir o que tenho
para fazer, para me situar sem enxergar a tela.

**Why P1**: Pedido explícito; é o ponto de partida sonoro do aluno-alvo.

**Acceptance Criteria**:

1. WHEN o aluno diz "listar/liste/lista (as) pendências" ou "(listar) atividades
   pendentes" THEN o sistema SHALL navegar para `/(app)/(tabs)/pendencias`
2. WHEN o comando de listar é reconhecido THEN o sistema SHALL falar um resumo
   das atividades **agrupado por matéria** (ex.: "Você tem 3 atividades
   pendentes. Em Matemática: Prova 1 e Exercício 2. Em Português: Redação.")
3. WHEN o aluno diz "listar pendências de \<X\>" THEN o resumo falado SHALL
   conter apenas a matéria \<X\>
4. WHEN o aluno não tem atividades (ou nenhuma na matéria pedida) THEN o sistema
   SHALL falar "Você não tem atividades pendentes[ em \<X\>]." e ainda assim
   navegar para Pendências

**Independent Test**: Aluno com pendências em 2 matérias → "listar pendências" →
cai em Pendências e ouve o resumo das 2 matérias.

---

### VAN-P2: Backend de IA ciente da navegação por atividade

**User Story**: Como aluno, quero que frases fora dos padrões fixos ("queria ver
aquela tarefa de ciências") ainda me levem à atividade, para não depender de
decorar comandos.

**Why P2**: Não bloqueia o MVP (os padrões Tier-1 cobrem as frases pedidas), mas
torna o reconhecimento robusto a linguagem natural.

**Acceptance Criteria**:

1. WHEN o Tier-1 não casa e a fala expressa intenção de abrir uma atividade THEN
   o backend (Gemini) SHALL retornar `command: 'NAVIGATE_TO_ACTIVITY'` com
   `payload: { name }`
2. WHEN o cliente recebe `NAVIGATE_TO_ACTIVITY` THEN ele SHALL usar **o mesmo
   resolver** client-side de VAN-P1 (abrir / desambiguar / não encontrei)
3. WHEN o backend recebe a intenção de listar pendências THEN ele SHALL poder
   retornar `LIST_PENDING_ACTIVITIES` com `payload.subjectName` opcional
4. WHEN o cliente recebe `LIST_PENDING_ACTIVITIES` THEN ele SHALL navegar para
   Pendências e ler o resumo (mesma lógica de VAN-P1: Listar pendências)
5. WHEN o prompt de contexto do aluno é montado THEN ele SHALL incluir os
   **títulos** das atividades pendentes agrupados por matéria (hoje envia só
   contagens), melhorando a extração do nome pela IA

**Independent Test**: Forçar uma transcrição que escape do Tier-1 → o backend
retorna `NAVIGATE_TO_ACTIVITY` → o cliente abre/desambigua a atividade.

---

### VAN-P3: Correção dos comandos de voz órfãos do aluno

**User Story**: Como mantenedor, quero que "entra na matéria X" role até a seção
e que "entra na turma X" do aluno deixe de ser um comando morto, para fechar o
ciclo de acessibilidade do refactor anterior.

**Why P3**: Higiene; não é o pedido central, mas elimina comportamento quebrado.

**Acceptance Criteria**:

1. WHEN o aluno diz "entra/abrir/ir para a matéria \<X\>" THEN o sistema SHALL
   navegar para Pendências e **rolar até a seção** da matéria \<X\>, anunciando-a
   por TTS e via `AccessibilityInfo.announceForAccessibility`
2. WHEN a matéria \<X\> não está na lista THEN o sistema SHALL falar "Não
   encontrei a matéria \<X\>." sem navegar para rota inexistente
3. WHEN um **aluno** diz "entra na turma \<X\>" THEN o sistema SHALL navegar para
   Pendências (não emitir um comando que nenhuma tela trata)
4. WHEN um **professor** diz "entra na turma \<X\>" THEN o comportamento atual
   SHALL ser preservado (navega para a turma)
5. WHEN o app é compilado THEN NÃO SHALL haver caminho de voz do aluno que
   navegue para `/subject/[id]` ou `/student/classroom/[id]`

**Independent Test**: Aluno → "entra na matéria X" → Pendências rola até a seção
X. Aluno → "entra na turma Y" → cai em Pendências sem erro.

---

## Edge Cases

- WHEN a cache `['student-activity-statuses']` está vazia ou expirada no momento
  do comando THEN o resolver SHALL buscar via `apiFetch('/activities/my-status')`
  e semear a cache antes de resolver
- WHEN o aluno fala uma matéria que existe mas não tem atividades disponíveis
  (todas `Submitted`/`Graded`) THEN o sistema SHALL ler a lista mencionando o
  status, em vez de afirmar "não encontrei"
- WHEN o termo casa com mais de uma **matéria** THEN o resolver SHALL escolher a
  primeira e seguir a desambiguação por atividades
- WHEN `pendingActivityPick` está ativo e chega um comando não relacionado THEN o
  estado de escolha SHALL ser descartado e o comando processado normalmente
- WHEN o comando de voz chega antes da sessão de auth estar hidratada THEN o
  resolver SHALL tratar token ausente sem quebrar (fala genérica "Não entendi.")
- WHEN o aluno está offline e a cache está vazia THEN o resolver SHALL falar uma
  mensagem de erro amigável em vez de travar
- WHEN o título falado é prefixo/substring de vários títulos THEN conta como
  múltiplas candidatas → desambiguação

---

## Arquivos Afetados

### Mobile (novo)
| Arquivo | Ação |
|---|---|
| `apps/mobile/lib/queryClient.ts` | Criar — singleton do `QueryClient` compartilhado |
| `apps/mobile/lib/studentActivities.ts` | Criar — resolver de atividades + resumo falado |

### Mobile (editar)
| Arquivo | Mudança |
|---|---|
| `apps/mobile/app/_layout.tsx` | Importar `queryClient` do módulo compartilhado |
| `apps/mobile/store/voiceCommand.ts` | Adicionar `pendingActivityPick` + setter |
| `apps/mobile/lib/voiceCommandDispatcher.ts` | Padrões Tier-1, pre-check de escolha, `postProcessAI`, correção de comandos órfãos |
| `apps/mobile/app/(app)/(tabs)/pendencias.tsx` | Scroll-to-section para `NAVIGATE_TO_SUBJECT` |

### Backend (editar)
| Arquivo | Mudança |
|---|---|
| `apps/backend/src/HackathonUnirios2026.Infra/AI/VoiceCommandPromptBuilder.cs` | Adicionar `NAVIGATE_TO_ACTIVITY`; documentar `subjectName` em `LIST_PENDING_ACTIVITIES` |
| `apps/backend/.../Features/VoiceCommands/Commands/ProcessVoiceCommandCommandHandler.cs` | Incluir títulos de atividades por matéria no contexto da IA |

---

## Requirement Traceability

| ID | Requisito | Story | Status |
|---|---|---|---|
| VAN-01 | `queryClient` extraído para módulo compartilhado | VAN-P1 | Pending |
| VAN-02 | `studentActivities.ts` — `resolveActivityQuery` + `buildPendingSummary` + `getStudentActivities` | VAN-P1 | Pending |
| VAN-03 | `pendingActivityPick` no store de voz | VAN-P1: Desambiguação | Pending |
| VAN-04 | Tier-1 "atividade de \<X\>" → resolve por matéria | VAN-P1: por matéria | Pending |
| VAN-05 | Tier-1 "atividade \<título\>" → resolve por título | VAN-P1: por título | Pending |
| VAN-06 | Resposta `CONFIRM` + lista falada na ambiguidade | VAN-P1: Desambiguação | Pending |
| VAN-07 | Pre-check de `pendingActivityPick` resolve a escolha | VAN-P1: Desambiguação | Pending |
| VAN-08 | Tier-1 "listar pendências [de \<X\>]" → navega + lê | VAN-P1: Listar | Pending |
| VAN-09 | `postProcessAI` trata `NAVIGATE_TO_ACTIVITY` | VAN-P2 | Pending |
| VAN-10 | `postProcessAI` trata `LIST_PENDING_ACTIVITIES` | VAN-P2 | Pending |
| VAN-11 | `NAVIGATE_TO_CLASSROOM` do aluno → Pendências | VAN-P3 | Pending |
| VAN-12 | `NAVIGATE_TO_SUBJECT` rola até a seção em Pendências | VAN-P3 | Pending |
| VAN-13 | Backend prompt — comando `NAVIGATE_TO_ACTIVITY` | VAN-P2 | Pending |
| VAN-14 | Backend contexto — títulos das atividades por matéria | VAN-P2 | Pending |

**Cobertura:** 14 requisitos, 14 mapeados para tarefas, 0 não mapeados.

## Success Criteria

- [ ] Aluno abre uma atividade por matéria e por título, falando, a partir de
      qualquer aba
- [ ] Ambiguidade → lista falada + overlay re-escuta + escolha funciona
- [ ] "Listar pendências [de X]" navega e lê o resumo correto
- [ ] `NAVIGATE_TO_SUBJECT` rola até a seção; "turma X" do aluno cai em Pendências
- [ ] Backend retorna `NAVIGATE_TO_ACTIVITY`; cliente resolve com o mesmo resolver
- [ ] `npx tsc --noEmit` em `apps/mobile` → 0 erros
- [ ] `dotnet build HackathonUnirios2026.sln` em `apps/backend` → sucesso
- [ ] Wake word e `VoiceAssistantButton` continuam funcionando em todas as telas
      do aluno; fluxo de voz do professor inalterado
