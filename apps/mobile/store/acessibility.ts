import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { AccessibilityPreferences } from '../types/activity';

const ACCESSIBILITY_KEY = 'hackathon.accessibility';

export type DefaultResponseFormat = 'text' | 'audio' | 'oral';

interface AccessibilityState extends AccessibilityPreferences {
  defaultResponseFormat: DefaultResponseFormat;
  setHighContrast: (value: boolean) => void;
  setFontSizeScale: (value: number) => void;
  setReducedMotion: (value: boolean) => void;
  setPrefersAudio: (value: boolean) => void;
  setPrefersVisual: (value: boolean) => void;
  setDefaultResponseFormat: (format: DefaultResponseFormat) => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  reset: () => void;
  load: () => Promise<void>;
}

const defaults = {
  highContrast: false,
  fontSizeScale: 1 as number,
  reducedMotion: false,
  prefersAudio: false,
  prefersVisual: false,
  screenReader: false,
  defaultResponseFormat: 'text' as DefaultResponseFormat,
};

type PersistedFields = typeof defaults;

async function readStorage(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return localStorage.getItem(ACCESSIBILITY_KEY);
    return SecureStore.getItemAsync(ACCESSIBILITY_KEY);
  } catch {
    return null;
  }
}

async function writeStorage(value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(ACCESSIBILITY_KEY, value);
    } else {
      await SecureStore.setItemAsync(ACCESSIBILITY_KEY, value);
    }
  } catch {}
}

function extractPersisted(s: AccessibilityState): PersistedFields {
  return {
    highContrast: s.highContrast,
    fontSizeScale: s.fontSizeScale,
    reducedMotion: s.reducedMotion,
    prefersAudio: s.prefersAudio,
    prefersVisual: s.prefersVisual,
    screenReader: s.screenReader,
    defaultResponseFormat: s.defaultResponseFormat,
  };
}

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  ...defaults,

  load: async () => {
    const raw = await readStorage();
    if (raw) {
      try {
        const data = JSON.parse(raw) as Partial<PersistedFields>;
        set({ ...defaults, ...data });
      } catch {}
    }
  },

  setHighContrast: (value) => {
    set({ highContrast: value });
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  setFontSizeScale: (value) => {
    const clamped = Math.max(0.8, Math.min(1.5, value));
    set({ fontSizeScale: clamped });
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  setReducedMotion: (value) => {
    set({ reducedMotion: value });
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  setPrefersAudio: (value) => {
    set({ prefersAudio: value });
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  setPrefersVisual: (value) => {
    set({ prefersVisual: value });
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  setDefaultResponseFormat: (format) => {
    set({ defaultResponseFormat: format });
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  toggleHighContrast: () => {
    set((s) => ({ highContrast: !s.highContrast }));
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  increaseFontSize: () => {
    set((s) => ({ fontSizeScale: Math.min(1.5, s.fontSizeScale + 0.1) }));
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  decreaseFontSize: () => {
    set((s) => ({ fontSizeScale: Math.max(0.8, s.fontSizeScale - 0.1) }));
    writeStorage(JSON.stringify(extractPersisted(get())));
  },
  reset: () => {
    set(defaults);
    writeStorage(JSON.stringify(defaults));
  },
}));
