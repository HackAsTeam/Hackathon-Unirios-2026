# Onboarding Role Fix — Specification

## Problem Statement

Ao selecionar "Sou Professor" ou "Sou Aluno" na tela de onboarding, a requisição
`PUT /auth/me/role` retorna 404. Isso bloqueia todo novo usuário de entrar no app.
Adicionalmente, usuários que já completaram o onboarding são redirecionados para
a tela de onboarding em todo cold start porque o store de onboarding não é
carregado do SecureStore.

## Goals

- [ ] `PUT /auth/me/role` não retorna 404 em desenvolvimento
- [ ] Usuários que já escolheram seu papel não veem a tela de onboarding ao reabrir o app
- [ ] Fluxo de onboarding funciona de ponta a ponta: cadastro → seleção de papel → home

## Out of Scope

| Feature | Razão |
|---|---|
| Redesign da tela de onboarding | Melhoria visual; não relacionada ao bug funcional |
| Suporte a múltiplos papéis por usuário | Fora do escopo do domínio atual |
| Onboarding para usuários existentes sem papel | Tratado pelo back-end; sem mudança necessária |

---

## User Stories

### OF-01: Seleção de papel funciona sem erro ⭐ MVP

**User Story**: Como novo usuário, quero selecionar meu papel (professor ou aluno)
no onboarding para que o app configure minha experiência corretamente.

**Acceptance Criteria**:

1. WHEN usuário toca "Sou Professor" THEN app SHALL chamar `PUT /auth/me/role`
   com `{ role: "teacher" }` e receber 200 OK
2. WHEN usuário toca "Sou Aluno" THEN app SHALL chamar `PUT /auth/me/role`
   com `{ role: "student" }` e receber 200 OK
3. WHEN seleção de papel é bem-sucedida THEN usuário SHALL ser redirecionado
   para a tela de home correspondente ao papel
4. WHEN requisição falha THEN usuário SHALL ver mensagem de erro clara

**Independent Test**: Criar nova conta → tela de onboarding aparece → tocar
"Sou Professor" → app navega para teacher home sem exibir erro de rede.

---

### OF-02: Onboarding não aparece em reinicializações ⭐ MVP

**User Story**: Como usuário que já completou o onboarding, quero que o app
lembre minha escolha de papel para não ter que selecionar novamente a cada abertura.

**Acceptance Criteria**:

1. WHEN usuário já completou onboarding e reabre o app THEN app SHALL navegar
   diretamente para a tela home, sem passar pelo onboarding
2. WHEN app é reiniciado a frio THEN `completed: true` SHALL ser restaurado
   do SecureStore antes da navegação acontecer
3. WHEN usuário faz logout e login novamente THEN sistema SHALL checar o
   estado de onboarding antes de redirecionar

**Independent Test**: Completar onboarding → fechar e reabrir app → app vai
direto para home sem mostrar tela de seleção de papel.

---

## Edge Cases

- WHEN token JWT expirou THEN `PUT /auth/me/role` SHALL retornar 401 e app
  SHALL redirecionar para tela de login
- WHEN `load()` do onboarding store falha (SecureStore corrompido) THEN
  usuário SHALL ser enviado para onboarding como fallback seguro

---

## Arquivos Afetados

| Arquivo | Mudança |
|---|---|
| `apps/backend/src/HackathonUnirios2026.API/Program.cs` | Guard `UseHttpsRedirection` com `!IsDevelopment()` |
| `apps/mobile/app/(app)/_layout.tsx` | Chamar `useOnboardingStore.getState().load()` no useEffect |

---

## Requirement Traceability

| Requirement ID | Story | Status |
|---|---|---|
| OF-01 | PUT /auth/me/role retorna 200 em dev | Done |
| OF-02 | Onboarding state persistido entre sessões | Done |

---

## Success Criteria

- [x] Novo usuário completa onboarding sem erro 404
- [x] Usuário retornante vai direto para home
- [x] `dotnet build` → 0 erros
- [x] `npx tsc --noEmit` → 0 erros
