import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Prompt } from "expo-auth-session";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { apiFetch, ApiError } from "./api";
import { useAuthStore } from "../store/auth";

const placeholderClientId = "000000000000-placeholder.apps.googleusercontent.com";

type AuthResponse = {
  userId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  token: string;
  role?: string | null;
};

export type GooglePendingDeletion = {
  restoreUntil: string;
  idToken: string;
};

// Required for the web OAuth redirect to close the popup automatically.
WebBrowser.maybeCompleteAuthSession();

// Native-only configuration (no-op on web).
if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

export async function signOutFromGoogle(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — the app session is already cleared
  }
}

export function useGoogleSignIn(onSuccess?: () => void) {
  const signIn = useAuthStore((state) => state.signIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingDeletion, setPendingDeletion] = useState<GooglePendingDeletion | null>(null);

  const configured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  // ── Web flow ─────────────────────────────────────────────────────────────
  const [, webResponse, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || placeholderClientId,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || placeholderClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || placeholderClientId,
  });

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (webResponse?.type !== "success") return;

    const idToken =
      (webResponse.params as Record<string, string>)["id_token"] ??
      webResponse.authentication?.idToken ??
      null;

    if (!idToken) {
      setError("Google não retornou um token de identidade.");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiFetch<AuthResponse>("/auth/google", {
      method: "POST",
      body: { idToken },
    })
      .then(async (data) => {
        await signIn(data.userId, data.token, data.email, data.displayName, data.avatarUrl, data.role);
        onSuccess?.();
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 403) {
          const body = err.body as { error?: string; restoreUntil?: string };
          if (body?.error === "ACCOUNT_PENDING_DELETION" && body.restoreUntil && idToken) {
            setPendingDeletion({ restoreUntil: body.restoreUntil, idToken });
            return;
          }
        }
        setError(err instanceof Error ? err.message : "Erro ao entrar com Google");
      })
      .finally(() => setLoading(false));
  }, [webResponse]);

  // ── Native flow ──────────────────────────────────────────────────────────
  async function signInWithGoogleNative(): Promise<AuthResponse | null> {
    setError("");
    setPendingDeletion(null);
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        setError("Google não retornou um token de identidade.");
        return null;
      }

      const data = await apiFetch<AuthResponse>("/auth/google", {
        method: "POST",
        body: { idToken },
      });

      await signIn(data.userId, data.token, data.email, data.displayName, data.avatarUrl, data.role);
      return data;
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) {
        const body = err.body as { error?: string; restoreUntil?: string };
        if (body?.error === "ACCOUNT_PENDING_DELETION" && body.restoreUntil) {
          const idToken = (await GoogleSignin.getTokens().catch(() => null))?.idToken ?? "";
          setPendingDeletion({ restoreUntil: body.restoreUntil, idToken });
          return null;
        }
      }
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          return null;
        }
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setError("Google Play Services não disponível.");
          return null;
        }
      }
      setError(err instanceof Error ? err.message : "Erro ao entrar com Google");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ── Unified entry point ──────────────────────────────────────────────────
  async function signInWithGoogle(): Promise<AuthResponse | null> {
    setError("");
    setPendingDeletion(null);
    if (Platform.OS === "web") {
      await promptAsync({ prompt: Prompt.SelectAccount });
      return null;
    }
    return signInWithGoogleNative();
  }

  return {
    configured,
    loading,
    error,
    pendingDeletion,
    setPendingDeletion,
    signInWithGoogle,
  };
}
