# Classroom Invite Specification

## Problem Statement

Professores criam turmas, mas não há como os alunos ingressarem nelas. O backend já tem o sistema de convites implementado (`POST /invitations`, `DELETE /invitations/{id}`, `POST /invitations/join`), mas a interface mobile não expõe esse fluxo. Sem isso, o ciclo professor→aluno nunca fecha.

## Goals

- [ ] Professor consegue gerar um link de convite para qualquer turma que gerencia
- [ ] Professor consegue compartilhar esse link (via share nativo do OS)
- [ ] Professor consegue revogar um convite gerado
- [ ] Aluno consegue ingressar em uma turma usando o token/link do convite
- [ ] Após ingressar, a lista de turmas do aluno atualiza imediatamente

## Out of Scope

| Feature | Razão |
|---|---|
| Deep linking automático (`/i/{token}`) | Requer configuração de URL scheme — fase posterior |
| Múltiplos convites simultâneos visíveis | Backend não tem GET /invitations?classroomId; estado de sessão é suficiente para o hackathon |
| Data de expiração configurável no app | Campo `expiresAt: null` é suficiente para o hackathon |
| Histórico de convites | Sem endpoint GET de listagem |
| Notificação push ao professor quando aluno entra | Fora do escopo |

---

## User Stories

### CI-P1: Professor gera link de convite ⭐ MVP

**User Story**: Como professor, quero gerar um link de convite para minha turma, para poder convidar alunos a ingressar.

**Acceptance Criteria**:

1. WHEN professor está na tela de detalhe de uma turma THEN sistema SHALL exibir seção "Convite" com botão "Gerar Link"
2. WHEN professor toca "Gerar Link" THEN sistema SHALL chamar `POST /invitations` com `classroomId` e exibir o card de convite gerado
3. WHEN convite é gerado THEN card SHALL exibir: URL do convite, contador de usos (useCount) e botão "Compartilhar"
4. WHEN professor toca "Compartilhar" THEN sistema SHALL abrir o share sheet nativo do OS com a `inviteUrl`
5. WHEN professor toca "Revogar" THEN sistema SHALL chamar `DELETE /invitations/{id}` e remover o card
6. WHEN `POST /invitations` falha THEN sistema SHALL exibir mensagem de erro inline, sem crash

**Independent Test**: Gerar link → tocar "Compartilhar" → share sheet abre com a URL correta.

---

### CI-P1: Aluno ingressa em turma via código ⭐ MVP

**User Story**: Como aluno, quero ingressar em uma turma usando o link ou código que recebi do professor, para poder acessar as atividades dela.

**Acceptance Criteria**:

1. WHEN aluno está na home (StudentHome) THEN sistema SHALL exibir botão "Ingressar com código"
2. WHEN aluno toca "Ingressar com código" THEN sistema SHALL exibir modal com campo de texto para colar a URL ou token
3. WHEN aluno confirma THEN sistema SHALL extrair o token (do URL completo ou token puro) e chamar `POST /invitations/join`
4. WHEN ingresso é bem-sucedido THEN sistema SHALL fechar modal, exibir toast/mensagem com "Você entrou em {classroomTitle}!" e invalidar query de turmas
5. WHEN token é inválido ou expirado THEN sistema SHALL exibir mensagem de erro no modal sem fechar
6. WHEN campo está vazio THEN botão "Confirmar" SHALL estar desabilitado

**Independent Test**: Professor gera link → aluno cola no modal → modal fecha com mensagem de sucesso → turma aparece na home do aluno.

---

## Edge Cases

- WHEN professor toca "Gerar Link" enquanto request está pendente THEN botão SHALL ficar desabilitado (prevent double-tap)
- WHEN professor já tem um convite gerado na sessão e toca "Gerar Link" novamente THEN sistema SHALL gerar NOVO convite (substituir card anterior)
- WHEN `inviteUrl` não contém `/i/` no path THEN sistema SHALL usar o valor inteiro como token (fallback)
- WHEN aluno já está matriculado na turma THEN backend retorna erro — sistema SHALL exibir "Você já faz parte desta turma"
- WHEN share sheet é cancelado THEN nenhuma ação adicional (comportamento nativo)

---

## Arquivos Afetados

### Mobile (editar)
| Arquivo | Mudança |
|---|---|
| `app/(app)/teacher/classroom/[id].tsx` | Adicionar seção "Convite" com geração, compartilhamento e revogação |
| `app/(app)/(tabs)/index.tsx` | Adicionar botão e modal "Ingressar com código" na StudentHome |

---

## Requirement Traceability

| Requirement ID | Story | Status |
|---|---|---|
| CI-01 | Professor — seção convite na tela da turma | Done |
| CI-02 | Professor — gerar link (POST /invitations) | Done |
| CI-03 | Professor — compartilhar link (Share nativo) | Done |
| CI-04 | Professor — revogar convite (DELETE /invitations/{id}) | Done |
| CI-05 | Aluno — botão "Ingressar com código" na StudentHome | Done |
| CI-06 | Aluno — modal + POST /invitations/join | Done |
| CI-07 | Aluno — feedback de sucesso + refresh de turmas | Done |

---

## Success Criteria

- [ ] Professor consegue gerar link e abrir o share sheet em menos de 3 taps
- [ ] Aluno consegue ingressar em uma turma usando o link/token em menos de 3 taps após recebê-lo
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] Nenhum crash em casos de erro de rede (todos têm tratamento de erro inline)
