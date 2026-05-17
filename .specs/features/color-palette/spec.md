# Spec: Paleta de Cores Unificada — ✅ DONE (2026-05-17)

## Contexto

O projeto tem dois sistemas de estilo coexistindo:
- **NativeWind (`className`)**: usado em auth, onboarding, profile, tabs — paleta verde (tailwind green-900/700/200)
- **`lib/colors.ts`**: usado em teacher, respond, activity — paleta **roxa** (`#6C5CE7`)

Isso causa inconsistência visual: o aluno vê telas verdes, o professor vê telas roxas. A paleta de referência é a das telas de auth (`sign-in`, `sign-up`) e a tab bar, que já usam verde.

## Referência de cores (auth + tab bar)

| Token Tailwind | Hex | Uso atual |
|---|---|---|
| `green-900` | `#14532d` | títulos em sign-in/sign-up |
| `green-700` | `#15803d` | links, cor de destaque |
| `green-600` | `#16a34a` | tab bar active tint, AppButton |
| `green-200` | `#bbf7d0` | tab bar border, divider |
| `green-50` | `#f0fdf4` | surface alternativo |
| `gray-500` | `#6b7280` | texto secundário |
| `gray-400` | `#9ca3af` | texto terciário / placeholder |
| `gray-200` | `#e5e7eb` | borders |
| `red-600` | `#ef4444` | erros |

## Requisitos

### REQ-1 — Cores primárias em `lib/colors.ts`
Atualizar as cores primárias para corresponder à paleta verde das telas de auth:
- `primary`: `#16a34a` (green-600 — alinha com tab bar `tabBarActiveTintColor`)
- `primaryLight`: `#bbf7d0` (green-200 — alinha com tab bar border e dividers)
- `primaryDark`: `#15803d` (green-700 — ação de destaque, links)

### REQ-2 — Background e superfícies
- `background`: `#FFFFFF` (white — alinha com `bg-white` das telas de auth)
- `surfaceAlt`: `#F0FDF4` (green-50 — substitui `#F4F3FF` que tinha tonalidade roxa)

### REQ-3 — Texto e link
- `text.link`: `#15803d` (green-700 — alinha com `text-green-700` usado em sign-in links)

### REQ-4 — Sombra de card
- `cardShadow`: `rgba(22, 163, 74, 0.08)` (verde em vez de roxo)

### REQ-5 — Cores de `formats` e `formatsLight` permanecem inalteradas
Essas cores são semânticas por tipo de formato de resposta, não fazem parte da paleta de marca. Não alterar.

### REQ-6 — Tab bar usa `colors.primary` via variável (sem hardcode)
`app/(app)/(tabs)/_layout.tsx` atualmente hardcoda `#16a34a` e `#bbf7d0`. Após REQ-1, substituir por `colors.primary` e `colors.primaryLight` importados de `@/lib/colors`.

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `apps/mobile/lib/colors.ts` | Atualizar tokens primários (REQ-1 a REQ-4) |
| `apps/mobile/app/(app)/(tabs)/_layout.tsx` | Usar `colors.primary` / `colors.primaryLight` (REQ-6) |

> Todos os outros arquivos que já importam `colors` de `@/lib/colors` (teacher, respond, activity) recebem as cores atualizadas automaticamente, sem alteração de código.

## Verificação

1. Navegação: tab bar ativa continua verde ✓ (antes era hardcoded, agora via `colors.primary`)
2. Telas de professor: ícones, botões e cards ficam verdes em vez de roxos ✓
3. Telas de resposta: badges de formato não mudam de cor (REQ-5) ✓
4. `npx tsc --noEmit` → 0 erros
