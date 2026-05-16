import { create } from 'zustand';
import { AccessibilityPreferences } from '../types/activity';

interface AccessibilityState extends AccessibilityPreferences {
  setHighContrast: (value: boolean) => void;
  setFontSizeScale: (value: number) => void;
  setReducedMotion: (value: boolean) => void;
  setPrefersAudio: (value: boolean) => void;
  setPrefersVisual: (value: boolean) => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  reset: () => void;
}

const defaults: AccessibilityPreferences = {
  highContrast: false,
  fontSizeScale: 1,
  reducedMotion: false,
  prefersAudio: false,
  prefersVisual: false,
  screenReader: false,
};

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  ...defaults,
  setHighContrast: (value) => set({ highContrast: value }),
  setFontSizeScale: (value) => set({ fontSizeScale: Math.max(0.8, Math.min(1.5, value)) }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setPrefersAudio: (value) => set({ prefersAudio: value }),
  setPrefersVisual: (value) => set({ prefersVisual: value }),
  toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
  increaseFontSize: () => set((s) => ({ fontSizeScale: Math.min(1.5, s.fontSizeScale + 0.1) })),
  decreaseFontSize: () => set((s) => ({ fontSizeScale: Math.max(0.8, s.fontSizeScale - 0.1) })),
  reset: () => set(defaults),
}));