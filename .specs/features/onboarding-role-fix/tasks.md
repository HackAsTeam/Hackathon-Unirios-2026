# Onboarding Role Fix — Tasks

**Design**: `.specs/features/onboarding-role-fix/design.md`
**Status**: Done

---

## Task Breakdown

### T1: Guard UseHttpsRedirection in development

**What**: Evitar que o backend redirecione requisições HTTP para HTTPS em desenvolvimento
**Where**: `apps/backend/src/HackathonUnirios2026.API/Program.cs`
**Depends on**: Nenhuma

**Done when**:
- [x] `UseHttpsRedirection()` envolto em `if (!app.Environment.IsDevelopment())`
- [x] `dotnet build HackathonUnirios2026.sln` → 0 erros
- [x] Requisição `PUT http://localhost:5099/auth/me/role` com token válido retorna 200

**Commit**: `fix(backend): skip HTTPS redirect in development to prevent PUT→GET downgrade`

---

### T2: Carregar onboarding store no layout raiz

**What**: Garantir que o estado de onboarding seja restaurado do SecureStore na inicialização
**Where**: `apps/mobile/app/(app)/_layout.tsx`
**Depends on**: Nenhuma

**Done when**:
- [x] `useOnboardingStore.getState().load()` chamado no `useEffect` do `AppLayout`
- [x] Import de `useOnboardingStore` adicionado
- [x] Usuário retornante vai direto para `/(app)/(tabs)` ao fazer login
- [x] `npx tsc --noEmit` → 0 erros

**Commit**: `fix(mobile): load onboarding store on app start to prevent onboarding loop`

---

### T3: Verificação final

**Done when**:
- [x] `dotnet build` → 0 erros
- [x] `npx tsc --noEmit` → 0 erros
- [x] Novo usuário: cadastro → onboarding → seleciona papel → navega para home (sem 404)
- [x] Usuário retornante: login → vai direto para home (sem tela de onboarding)

---

## Status

| Task | Status |
|---|---|
| T1: Guard UseHttpsRedirection | Done |
| T2: Load onboarding store | Done |
| T3: Verificação final | Done |
