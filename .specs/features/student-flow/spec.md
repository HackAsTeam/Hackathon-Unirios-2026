# Student Flow Specification

## Problem Statement

O fluxo do aluno existe parcialmente: a home lista turmas/atividades, e há telas de resposta (texto, áudio, oral). Porém o aluno não consegue ver o status das suas tentativas, não recebe feedback do professor, e não tem como personalizar como prefere interagir com o app — o que é crítico para alunos com necessidades sensoriais, público-alvo do projeto.

A plataforma tem como cerne: **professor cria (escrito) → aluno recebe e responde no formato que preferir → professor recebe em formato padronizado**. A ponte de formato é a proposta de inclusão. Sem as preferências de acessibilidade e a tela de resultados, o ciclo está incompleto.

## Goals

- [ ] Aluno consegue configurar seu formato padrão de resposta e preferências visuais uma única vez, sem repetir a escolha a cada atividade
- [ ] Aluno consegue ver o status de todas as suas atividades (pendente, enviado, avaliado) e a nota/feedback do professor
- [ ] A interface é projetada para ser navegável por leitores de tela e preparada para integração de voz futura (sem implementar voz agora)

## Out of Scope

| Feature | Razão |
|---|---|
| TTS — leitura de enunciados em voz alta | Fase posterior; UI deve ter placeholder/espaço reservado |
| STT — transcrição real de voz para texto | Oral screen continua com mock; integração real é fase posterior |
| Navegação por voz (VoiceOver/TalkBack full flow) | Fase posterior; labels e roles de acessibilidade devem estar presentes |
| Edição/exclusão de tentativas | Fora do modelo pedagógico atual |
| Notificações push ao ser avaliado | Fora de escopo do hackathon |
| Múltiplas tentativas por atividade | Backend só permite uma; não alterar regra agora |

---

## User Stories

### SF-P1: Preferências de Acessibilidade no Perfil ⭐ MVP

**User Story**: Como aluno, quero definir meu formato padrão de resposta e minhas preferências visuais no perfil, para não precisar reconfigurar a cada atividade.

**Why P1**: Sem isso, alunos com necessidades especiais precisam selecionar o formato toda vez — fricção desnecessária que quebra a proposta de inclusão.

**Acceptance Criteria**:

1. WHEN aluno acessa a tela de Perfil THEN sistema SHALL exibir seção "Acessibilidade" com controles para: formato padrão de resposta (Texto / Áudio / Oral), tamanho de fonte (4 opções: pequeno/médio/grande/extra-grande), alto contraste (toggle), reduzir animações (toggle)
2. WHEN aluno altera qualquer preferência THEN sistema SHALL persistir localmente (AsyncStorage) e aplicar imediatamente na sessão
3. WHEN aluno fecha e reabre o app THEN sistema SHALL restaurar as preferências salvas
4. WHEN preferência de formato padrão é "Áudio" THEN ao abrir uma atividade o seletor de formato SHALL pré-selecionar "Áudio"
5. WHEN preferência de tamanho de fonte é "extra-grande" THEN textos das telas de atividade e resposta SHALL escalar proporcionalmente

**Independent Test**: Definir formato "Oral" no perfil → fechar app → reabrir → abrir atividade → modal de formato deve abrir com "Oral" selecionado.

---

### SF-P1: Status de Tentativas na Home ⭐ MVP

**User Story**: Como aluno, quero ver o status de cada atividade na home (pendente, enviado, avaliado), para saber o que ainda preciso fazer e o que já foi avaliado.

**Why P1**: Sem status visível, o aluno não sabe o que está pendente. É o mínimo para orientação pedagógica.

**Acceptance Criteria**:

1. WHEN aluno expande uma turma na home THEN sistema SHALL exibir, ao lado de cada atividade, um badge de status: `Pendente` (cinza), `Enviado` (azul), `Avaliado` (verde com nota)
2. WHEN status é `Avaliado` THEN badge SHALL exibir a nota (ex: `★ 8.5`)
3. WHEN não há tentativa registrada THEN badge SHALL exibir `Pendente`
4. WHEN aluno toca em atividade com status `Enviado` ou `Avaliado` THEN sistema SHALL exibir na tela de detalhe o estado correto (não o CTA de "Iniciar")

**Independent Test**: Responder e enviar uma atividade → voltar para home → expandir a turma → badge da atividade muda de "Pendente" para "Enviado".

---

### SF-P1: Estado da Tentativa na Tela de Atividade ⭐ MVP

**User Story**: Como aluno, quero que a tela de detalhe da atividade reflita o estado real da minha tentativa, para saber se devo iniciar, continuar ou já aguardar resultado.

**Why P1**: Hoje a tela sempre mostra "Responder" mesmo quando o aluno já enviou. Isso é confuso e pode levar a tentar responder novamente.

**Acceptance Criteria**:

1. WHEN aluno abre atividade sem tentativa prévia THEN sistema SHALL exibir botão "Iniciar Atividade" e seletor de formato (pré-selecionado com preferência global)
2. WHEN aluno abre atividade com tentativa `InProgress` THEN sistema SHALL exibir botão "Continuar" e indicador "X de Y questões respondidas"
3. WHEN aluno abre atividade com tentativa `Submitted` THEN sistema SHALL exibir badge "Enviado ✓", texto "Aguardando avaliação" e botão "Ver detalhes"
4. WHEN aluno abre atividade com tentativa `Graded` THEN sistema SHALL exibir badge com nota (ex: `★ 8.5 / 10`) e botão "Ver resultado"
5. WHEN botão "Ver detalhes" ou "Ver resultado" é tocado THEN sistema SHALL navegar para `/attempt/[id]`

**Independent Test**: Submeter uma atividade → reabrir a tela da mesma atividade → deve mostrar "Enviado ✓" e não o botão "Iniciar".

---

### SF-P1: Aba "Resultados" ⭐ MVP

**User Story**: Como aluno, quero uma aba dedicada para ver todas as minhas tentativas e resultados, organizada por status.

**Why P1**: É o destino central para acompanhamento pedagógico — fechando o ciclo do fluxo principal.

**Acceptance Criteria**:

1. WHEN aluno (role = 'student') abre o app THEN sistema SHALL exibir aba "Resultados" na bottom nav (3ª posição entre Home e Perfil)
2. WHEN usuário tem role = 'teacher' THEN aba "Resultados" NÃO SHALL aparecer na bottom nav
3. WHEN aluno acessa aba Resultados THEN sistema SHALL exibir lista de tentativas agrupadas: primeiro "Avaliados", depois "Enviados", depois "Em andamento"
4. WHEN não há tentativas THEN sistema SHALL exibir empty state: "Você ainda não respondeu nenhuma atividade"
5. WHEN tentativa está `Graded` THEN card SHALL exibir nome da atividade, nome da turma, data de envio e nota final
6. WHEN tentativa está `Submitted` THEN card SHALL exibir nome da atividade, nome da turma, data de envio e label "Aguardando avaliação"
7. WHEN aluno toca em um card de resultado THEN sistema SHALL navegar para `/attempt/[id]`

**Independent Test**: Ter ao menos uma tentativa enviada → abrir aba Resultados → card com nome correto da atividade e status "Aguardando avaliação" deve aparecer.

---

### SF-P1: Tela de Detalhe da Tentativa ⭐ MVP

**User Story**: Como aluno, quero ver minhas respostas junto com o feedback e nota do professor, para entender onde errei e o que aprendi.

**Why P1**: É onde o ciclo se fecha para o aluno. Sem isso, a avaliação do professor não chega ao aluno.

**Acceptance Criteria**:

1. WHEN aluno acessa `/attempt/[id]` THEN sistema SHALL exibir: cabeçalho com nome da atividade, nome da turma e status; para cada questão: enunciado, resposta do aluno e (se `Graded`) nota parcial e feedback
2. WHEN tentativa está `Graded` THEN sistema SHALL exibir nota total no cabeçalho (ex: "Nota: 8.5 / 10")
3. WHEN tentativa está `Submitted` THEN sistema SHALL exibir respostas sem nota/feedback com label "Aguardando avaliação do professor"
4. WHEN tentativa está `InProgress` THEN sistema SHALL exibir respostas parciais e botão "Continuar respondendo"
5. WHEN preferência de alto contraste está ativa THEN tela SHALL usar esquema de cores de alto contraste
6. WHEN preferência de fonte grande está ativa THEN textos SHALL escalar proporcionalmente

**Independent Test**: Professor avalia uma resposta com nota e feedback → aluno acessa a tentativa → enunciado, resposta, nota e feedback aparecem corretamente.

---

### SF-P2: Placeholder de Áudio na Tela de Atividade

**User Story**: Como designer do fluxo, quero que a tela de atividade em modo "Áudio" tenha um espaço reservado para o botão de leitura em voz alta, para que a integração de TTS futura não exija redesenho da tela.

**Why P2**: Não bloqueia o MVP, mas garante que a UI está preparada para a fase de voz sem retrabalho.

**Acceptance Criteria**:

1. WHEN aluno seleciona formato "Áudio" e abre a tela de atividade THEN sistema SHALL exibir, abaixo do enunciado de cada questão, um botão `[▶ Ouvir questão]` visualmente presente porém `disabled` com label de acessibilidade "Leitura em voz alta — em breve"
2. WHEN botão `[▶ Ouvir questão]` é tocado THEN sistema SHALL NÃO executar nenhuma ação (disabled)

**Independent Test**: Selecionar formato "Áudio" → tela de atividade mostra o botão desabilitado em cada questão.

---

## Edge Cases

- WHEN aluno abre atividade e a requisição `GET /attempts?examId={id}` falha THEN sistema SHALL exibir CTA de "Iniciar" como fallback (comportamento conservador)
- WHEN lista de resultados está carregando THEN sistema SHALL exibir skeletons ou ActivityIndicator
- WHEN tentativa tem `AnsweredCount = 0` mas status `InProgress` THEN "Continuar" SHALL aparecer (não "Iniciar"), pois a tentativa já foi criada no backend
- WHEN aluno está na aba Resultados e não há internet THEN sistema SHALL exibir dados cacheados pelo TanStack Query com indicador visual de "última atualização"
- WHEN `AttemptDetailResponse` não contém `ExamTitle` ou `ClassroomName` (erro de contrato) THEN sistema SHALL exibir "Atividade" como fallback

---

## Arquivos Afetados

### Mobile (novo)
| Arquivo | Ação |
|---|---|
| `apps/mobile/store/accessibility.ts` | Criar — store Zustand com persist |
| `apps/mobile/app/(app)/(tabs)/results.tsx` | Criar — tela de resultados |
| `apps/mobile/app/(app)/attempt/[id].tsx` | Criar — detalhe da tentativa |

### Mobile (editar)
| Arquivo | Mudança |
|---|---|
| `apps/mobile/app/(app)/(tabs)/_layout.tsx` | Aba Resultados condicional por role |
| `apps/mobile/app/(app)/(tabs)/profile.tsx` | Seção Acessibilidade |
| `apps/mobile/app/(app)/(tabs)/index.tsx` | Badges de status em StudentClassroomCard |
| `apps/mobile/app/(app)/activity/[id].tsx` | Estado da tentativa + formato padrão |

### Backend (novo)
| Arquivo | Ação |
|---|---|
| `Features/ExamAttempts/Queries/GetAttemptDetailQuery.cs` | Criar |
| `Features/ExamAttempts/Queries/GetAttemptDetailQueryHandler.cs` | Criar |
| `Features/ExamAttempts/DTOs/AttemptDetailResponse.cs` | Criar — com `AnswerDetailResponse` |

### Backend (editar)
| Arquivo | Mudança |
|---|---|
| `Features/ExamAttempts/DTOs/AttemptResponse.cs` | Adicionar `ExamTitle`, `ClassroomName` |
| `Features/ExamAttempts/Queries/GetMyAttemptsQueryHandler.cs` | Join com Exam + Classroom |
| `API/Features/Attempts/AttemptEndpoints.cs` | Registrar `GET /attempts/{id}` |

---

## Requirement Traceability

| Requirement ID | Story | Status |
|---|---|---|
| SF-01 | Preferências de acessibilidade — store + persist | Done |
| SF-02 | Preferências de acessibilidade — UI no perfil | Done |
| SF-03 | Preferências aplicadas nas telas existentes de resposta | Done |
| SF-04 | Badges de status na home (StudentClassroomCard) | Done |
| SF-05 | Estado da tentativa na tela de atividade | Done |
| SF-06 | Formato padrão pré-selecionado no modal | Done |
| SF-07 | Aba Resultados — condicional por role | Done |
| SF-08 | Tela Resultados — lista agrupada por status | Done |
| SF-09 | Tela Resultados — empty state | Done |
| SF-10 | Tela Detalhe da Tentativa — questões + respostas + feedback | Done |
| SF-11 | Backend — enriquecer AttemptResponse com ExamTitle + ClassroomName | Done |
| SF-12 | Backend — GET /attempts/{id} com answers detail | Done |
| SF-13 | Placeholder botão TTS (disabled) no modo Áudio | Done |

---

## Success Criteria

- [ ] Aluno com deficiência visual consegue configurar formato "Oral" uma única vez e abrir qualquer atividade já com esse formato pré-selecionado
- [ ] Aluno consegue ver nota e feedback do professor sem precisar reabrir a atividade original
- [ ] Aba Resultados não aparece para o professor (sem poluição na nav)
- [ ] `npx tsc --noEmit` → 0 erros após implementação completa
- [ ] Todos os novos componentes têm `accessibilityLabel`, `accessibilityRole` e `accessibilityHint` adequados
