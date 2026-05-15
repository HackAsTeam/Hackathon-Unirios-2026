import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

const AUTH_STORAGE_KEY = "hackathon.auth";

interface AuthState {
  userId: string | null;
  token: string | null;
  isSignedIn: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (userId: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

type PersistedAuthState = {
  userId: string;
  token: string;
};

async function getStoredAuth() {
  if (Platform.OS === "web") {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  }

  return SecureStore.getItemAsync(AUTH_STORAGE_KEY);
}

async function setStoredAuth(auth: PersistedAuthState) {
  const value = JSON.stringify(auth);
  if (Platform.OS === "web") {
    localStorage.setItem(AUTH_STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, value);
}

async function deleteStoredAuth() {
  if (Platform.OS === "web") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  isSignedIn: false,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await getStoredAuth();
      if (!raw) {
        set({ hydrated: true });
        return;
      }

      const auth = JSON.parse(raw) as PersistedAuthState;
      set({
        userId: auth.userId,
        token: auth.token,
        isSignedIn: Boolean(auth.userId && auth.token),
        hydrated: true,
      });
    } catch {
      await deleteStoredAuth();
      set({ userId: null, token: null, isSignedIn: false, hydrated: true });
    }
  },
  signIn: async (userId, token) => {
    await setStoredAuth({ userId, token });
    set({ userId, token, isSignedIn: true, hydrated: true });
  },
  signOut: async () => {
    await deleteStoredAuth();
    set({ userId: null, token: null, isSignedIn: false, hydrated: true });
  },
}));
