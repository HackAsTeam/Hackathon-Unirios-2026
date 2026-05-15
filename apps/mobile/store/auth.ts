import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  token: string | null;
  isSignedIn: boolean;
  signIn: (userId: string, token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  isSignedIn: false,
  signIn: (userId, token) => set({ userId, token, isSignedIn: true }),
  signOut: () => set({ userId: null, token: null, isSignedIn: false }),
}));
