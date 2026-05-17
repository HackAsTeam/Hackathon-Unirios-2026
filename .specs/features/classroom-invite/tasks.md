# Classroom Invite — Tasks

**Design**: `.specs/features/classroom-invite/design.md`
**Status**: Draft

---

## Task Breakdown

### T1: Seção "Convite" na tela do professor (`classroom/[id].tsx`)

**What**: Adicionar geração, exibição, compartilhamento e revogação de links de convite
**Where**: `apps/mobile/app/(app)/teacher/classroom/[id].tsx`
**Depends on**: Nenhuma (tipos já existem em `types/classroom.ts`)
**Requirement**: CI-01, CI-02, CI-03, CI-04

**Done when**:
- [ ] Estado `activeInvite: InvitationLinkResponse | null` adicionado
- [ ] Mutation `generateInvite` (POST /invitations) implementada e conectada ao botão
- [ ] Mutation `revokeInvite` (DELETE /invitations/{id}) implementada e conectada
- [ ] Seção "Convite de Alunos" renderizada abaixo de "Matérias"
- [ ] Card de convite exibe `inviteUrl`, `useCount`, botões Compartilhar + Revogar
- [ ] `Share.share({ message: inviteUrl })` chamado no toque de "Compartilhar"
- [ ] Botão "Gerar" desabilitado durante request pendente
- [ ] Erro de geração exibido inline
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): adiciona geração e compartilhamento de convite na tela da turma`

---

### T2: Modal "Ingressar com código" na StudentHome (`index.tsx`)

**What**: Botão + modal para aluno ingressar em turma via token/URL
**Where**: `apps/mobile/app/(app)/(tabs)/index.tsx`
**Depends on**: Nenhuma
**Requirement**: CI-05, CI-06, CI-07

**Done when**:
- [ ] Botão "Ingressar" visível na StudentHome (header ou próximo ao título "Minhas Turmas")
- [ ] Modal com TextInput para colar URL ou token
- [ ] `extractToken(input)` funciona para URL completa e token puro
- [ ] Mutation `joinClassroom` (POST /invitations/join) implementada
- [ ] Sucesso: modal fecha, mensagem com `classroomTitle`, invalidação de `['classrooms']`
- [ ] Erro: mensagem inline no modal, modal permanece aberto
- [ ] Botão "Confirmar" desabilitado quando input vazio ou request pendente
- [ ] `npx tsc --noEmit` → 0 erros

**Commit**: `feat(mobile): adiciona fluxo de ingresso em turma via link de convite`

---

### T3: Verificação final

**Done when**:
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] Professor gera link → card aparece com URL → "Compartilhar" abre share sheet
- [ ] Professor revoga → card desaparece
- [ ] Aluno cola URL completa → extrai token → ingresso bem-sucedido → turma aparece na home
- [ ] Aluno cola token puro → mesmo comportamento
- [ ] Erros de rede não crasham a tela

**Commit**: `chore: type check fluxo classroom-invite`

---

## Status

| Task | Status |
|---|---|
| T1: Seção Convite — teacher | Done |
| T2: Modal Ingressar — student | Done |
| T3: Verificação final | Done |
