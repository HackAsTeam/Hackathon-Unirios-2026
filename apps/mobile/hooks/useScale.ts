import { useAccessibilityStore } from '@/store/acessibility';

export function useScale() {
  const fontSizeScale = useAccessibilityStore((s) => s.fontSizeScale);
  return (base: number) => Math.round(base * fontSizeScale);
}
