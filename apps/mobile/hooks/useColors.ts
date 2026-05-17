import { useAccessibilityStore } from '@/store/acessibility';
import { colors, highContrastColors } from '@/lib/colors';

export function useColors() {
  const highContrast = useAccessibilityStore((s) => s.highContrast);
  return highContrast ? highContrastColors : colors;
}
