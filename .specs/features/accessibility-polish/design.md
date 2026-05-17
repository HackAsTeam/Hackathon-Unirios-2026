# Accessibility Polish — Design

**Spec**: `.specs/features/accessibility-polish/spec.md`
**Status**: Draft

---

## Architecture Overview

```
lib/colors.ts
  ├── colors (existing)
  ├── highContrastColors (new — same shape)
  └── formatIcons (edit — emoji → Ionicons names)

hooks/
  ├── useColors.ts (new) — reads highContrast → returns colors | highContrastColors
  └── useScale.ts  (new) — reads fontSizeScale → returns scale(n) fn

Shared components (edit):
  ├── components/ui/EmptyState.tsx    — iconName: string → <Ionicons>
  ├── components/ui/ErrorState.tsx    — emoji → <Ionicons>
  ├── components/ui/Chip.tsx          — iconName: string → <Ionicons>
  └── components/format/FormatIcon.tsx — emoji → <Ionicons> via formatIcons

Screens (edit — apply useColors + useScale):
  app/(app)/(tabs)/index.tsx
  app/(app)/(tabs)/results.tsx
  app/(app)/(tabs)/profile.tsx
  app/(app)/subject/[id].tsx
  app/(app)/activity/[id].tsx        (replace inline ternaries)
  app/(app)/attempt/[id].tsx         (replace inline ternaries)
  app/(app)/teacher/classroom/[id].tsx
  app/(app)/teacher/classroom/[id]/subject/[subjectId].tsx
```

---

## High Contrast Palette

`highContrastColors` has **exactly the same shape** as `colors` so any screen can swap them without type errors.

| Token | Light | High Contrast |
|---|---|---|
| `background` | `#FFFFFF` | `#000000` |
| `surface` | `#FFFFFF` | `#111111` |
| `surfaceAlt` | `#F0FDF4` | `#1a1a1a` |
| `primary` | `#16a34a` | `#4ade80` |
| `primaryLight` | `#bbf7d0` | `#166534` |
| `primaryDark` | `#15803d` | `#86efac` |
| `text.primary` | `#1A1A2E` | `#ffffff` |
| `text.secondary` | `#6B7280` | `#aaaaaa` |
| `text.tertiary` | `#9CA3AF` | `#888888` |
| `text.inverse` | `#FFFFFF` | `#000000` |
| `text.link` | `#15803d` | `#4ade80` |
| `border` | `#E5E7EB` | `#444444` |
| `borderLight` | `#F3F4F6` | `#333333` |
| `divider` | `#F0F0F5` | `#222222` |
| `success` | `#22C55E` | `#4ade80` |
| `successLight` | `#DCFCE7` | `#052e16` |
| `warning` | `#EAB308` | `#fbbf24` |
| `warningLight` | `#FEF9C3` | `#451a03` |
| `error` | `#EF4444` | `#f87171` |
| `errorLight` | `#FEE2E2` | `#450a0a` |
| `info` | `#3B82F6` | `#60a5fa` |
| `infoLight` | `#DBEAFE` | `#1e3a5f` |
| `formats.*` | (unchanged) | (unchanged — still used for color-coding) |
| `formatsLight.*` | pastel tints | dark backgrounds (e.g. `#1e1b4b` for text) |
| `cardShadow` | `rgba(22,163,74,0.08)` | `transparent` |
| `overlay` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.7)` |

---

## Hooks Design

### `hooks/useColors.ts`
```typescript
import { useAccessibilityStore } from '@/store/acessibility';
import { colors, highContrastColors } from '@/lib/colors';

export function useColors() {
  const highContrast = useAccessibilityStore((s) => s.highContrast);
  return highContrast ? highContrastColors : colors;
}
```

### `hooks/useScale.ts`
```typescript
import { useAccessibilityStore } from '@/store/acessibility';

export function useScale() {
  const fontSizeScale = useAccessibilityStore((s) => s.fontSizeScale);
  return (base: number) => Math.round(base * fontSizeScale);
}
```

**Usage pattern** in any screen:
```typescript
const c = useColors();
const scale = useScale();

// Then use:
// c.background, c.text.primary, c.primary etc.
// scale(16)  →  16 * fontSizeScale (rounded)
```

---

## Ionicons Mapping for `formatIcons`

| Format | Old (emoji) | New (Ionicons name) |
|---|---|---|
| text | `✍️` | `create-outline` |
| audio | `🎤` | `mic-outline` |
| video | `🎬` | `videocam-outline` |
| drawing | `🎨` | `brush-outline` |
| mindmap | `🧠` | `git-network-outline` |
| presentation | `📽️` | `easel-outline` |
| quiz | `❓` | `help-circle-outline` |
| podcast | `🎙️` | `radio-outline` |
| oral | `🗣️` | `chatbubble-ellipses-outline` |

---

## Component API Changes

### `EmptyState`
```typescript
// Before
interface EmptyStateProps {
  icon?: string;   // emoji string, e.g. "📚"
  ...
}

// After
interface EmptyStateProps {
  iconName?: string;   // Ionicons name, e.g. "library-outline"
  iconColor?: string;  // optional override; defaults to c.text.tertiary
  ...
}
```

### `Chip`
```typescript
// Before
icon?: string;   // emoji string

// After
iconName?: string;   // Ionicons name
```

### Callers — EmptyState iconName mapping

| Screen | Old emoji | New iconName |
|---|---|---|
| `index.tsx` StudentHome | `"📚"` | `"library-outline"` |
| `index.tsx` StudentHome | `"🏫"` | `"school-outline"` |
| `results.tsx` | `"📝"` | `"document-text-outline"` |
| `subject/[id].tsx` | `"📝"` | `"document-text-outline"` |
| `teacher/classroom/[id].tsx` | `"📚"` | `"library-outline"` |
| `teacher/.../subject/[subjectId].tsx` | `"📝"` | `"document-text-outline"` |

---

## Screen Update Pattern

Each screen follows the same migration:

```typescript
// 1. Import hooks
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';

// 2. Call at component top
const c = useColors();
const scale = useScale();

// 3. Replace
//   colors.background  →  c.background
//   colors.text.primary  →  c.text.primary
//   fontSize: 16  →  fontSize: scale(16)
```

For `activity/[id].tsx` and `attempt/[id].tsx` specifically: remove the existing
`const bg = highContrast ? '#000' : colors.background` inline ternaries and the
local `scale(n)` helper function; replace with the two hooks.

---

## Data Flow

```
User toggles "Alto Contraste" in profile
  → setHighContrast(true) in accessibility store
  → store writes to SecureStore
  → useAccessibilityStore reactive update
  → useColors() in every mounted screen re-runs
  → all c.* references re-render with dark palette
  → no navigation needed
```

---

## Error Handling

| Cenário | Tratamento |
|---|---|
| `fontSizeScale` fora de [0.8, 1.5] | Store já faz clamp — `useScale` recebe valor válido |
| Ionicons name inválido | RN renderiza sem ícone, sem crash |
| `highContrastColors` sem token | TypeScript garante mesma shape em tempo de compilação |
