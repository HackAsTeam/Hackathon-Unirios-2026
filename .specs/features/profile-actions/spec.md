# Spec: Ações do Perfil — Logout e Deletar Conta

## Contexto

A tela `app/(app)/(tabs)/profile.tsx` tem:
- `handleSignOut()` definida (chama `signOut()` do store e redireciona para sign-in) **mas não conectada a nenhum botão visível**
- Um botão "Excluir Conta e Dados" com `border-red-400` / `text-red-500`, mas sem nenhum `onPress` implementado e sem indicação visual de que é um placeholder

O usuário precisa de um caminho claro para sair da sessão, e o botão de exclusão deve comunicar visualmente que a funcionalidade está pendente.

## Requisitos

### REQ-1 — Botão de Logout visível e funcional
Adicionar um botão "Sair" na seção inferior da tela de perfil, **antes** do botão de exclusão.

Comportamento:
- `onPress`: chama `handleSignOut()` já existente (que chama `signOut()` do store + `router.replace('/(auth)/sign-in')`)
- Estilo: destaque neutro (não destrutivo) — `border border-gray-300 rounded-xl py-4 items-center`
- Label: `"Sair"` com `text-gray-700 font-semibold text-base`

### REQ-2 — Botão "Deletar Conta" claramente como placeholder
O botão de exclusão já existe visualmente mas é `TouchableOpacity` com `onPress` implicitamente vazio. Ajustar para:
- Permanecer visível com estilo destrutivo (`border-red-400`, `text-red-500`) inalterado
- Adicionar tag `"Em breve"` inline ou `opacity-50` para sinalizar que não está implementado
- `disabled={true}` para desabilitar o toque até que a funcionalidade seja implementada
- Remover o comentário `{/* LEMBRAR DE IMPLEMENTAR A FUNÇÃO DE EXCLUSÃO DE CONTA */}` (esse tipo de lembrete não pertence ao código)

### REQ-3 — Consistência com paleta verde
Após execução do spec `color-palette`, o botão de logout deve usar `text-green-700` ou equivalente para o texto ao invés de gray, caso a decisão de design prefira consistência com o primary. Esta decisão é deixada para a execução — o padrão inicial é gray (neutro).

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `apps/mobile/app/(app)/(tabs)/profile.tsx` | Adicionar botão Sair (REQ-1), ajustar botão de exclusão (REQ-2) |

## Layout esperado (seção de ações)

```
┌─────────────────────────────────────┐
│  Sair                               │  ← border-gray-300, text-gray-700
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Excluir Conta e Dados   [Em breve] │  ← border-red-400, text-red-500, disabled
└─────────────────────────────────────┘
```

## Verificação

1. Tocar "Sair" → limpa store → redireciona para sign-in ✓
2. Tocar "Excluir Conta e Dados" → nenhuma ação (disabled) ✓
3. Tag "Em breve" visível no botão de exclusão ✓
4. `npx tsc --noEmit` → 0 erros
