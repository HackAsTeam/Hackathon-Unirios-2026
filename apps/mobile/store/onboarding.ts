import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

const ONBOARDING_KEY = 'hackathon.onboarding';

export type UserRole = 'teacher' | 'student';

interface OnboardingState {
  role: UserRole | null;
  completed: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  role: null,
  completed: false,
  loaded: false,

  load: async () => {
    try {
      const raw =
        Platform.OS === 'web'
          ? localStorage.getItem(ONBOARDING_KEY)
          : await SecureStore.getItemAsync(ONBOARDING_KEY);

      if (raw) {
        const data = JSON.parse(raw) as { role: UserRole; completed: boolean };
        set({ role: data.role, completed: data.completed ?? true, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  setRole: async (role) => {
    const value = JSON.stringify({ role, completed: true });
    if (Platform.OS === 'web') {
      localStorage.setItem(ONBOARDING_KEY, value);
    } else {
      await SecureStore.setItemAsync(ONBOARDING_KEY, value);
    }
    set({ role, completed: true });
  },

  reset: async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ONBOARDING_KEY);
    } else {
      await SecureStore.deleteItemAsync(ONBOARDING_KEY);
    }
    set({ role: null, completed: false });
  },
}));
