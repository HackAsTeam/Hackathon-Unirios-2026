import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { apiFetch } from "./api";
import { useAuthStore } from "../store/auth";

const placeholderClientId = "000000000000-placeholder.apps.googleusercontent.com";

type AuthResponse = {
  userId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  token: string;
};

// Required for the web OAuth redirect to close the popup automatically.
WebBrowser.maybeCompleteAuthSession();

// Native-only configuration (no-op on web).
if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

export function useGoogleSignIn(onSuccess?: () => void) {
  const signIn = useAuthStore((state) => state.signIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const configured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  // ── Web flow ─────────────────────────────────────────────────────────────
  // useIdTokenAuthRequest requests ResponseType.IdToken on web (implicit flow)
  // so the token arrives in response.params.id_token without a backend exchange.
  const [, webResponse, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || placeholderClientId,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || placeholderClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || placeholderClientId,
  });

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (webResponse?.type !== "success") return;

    const idToken =
      // Implicit IdToken flow on web puts the token in params.id_token
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
        await signIn(data.userId, data.token, data.email, data.displayName, data.avatarUrl);
        onSuccess?.();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Erro ao entrar com Google";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [webResponse]);

  // ── Native flow ──────────────────────────────────────────────────────────
  async function signInWithGoogleNative(): Promise<AuthResponse | null> {
    setError("");
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

      await signIn(data.userId, data.token, data.email, data.displayName, data.avatarUrl);
      return data;
    } catch (err: unknown) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          return null;
        }
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setError("Google Play Services não disponível.");
          return null;
        }
      }
      const message =
        err instanceof Error ? err.message : "Erro ao entrar com Google";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ── Unified entry point ──────────────────────────────────────────────────
  // On web: triggers promptAsync (the response is handled in the useEffect above).
  // On native: runs the GoogleSignin flow end-to-end and returns the result.
  async function signInWithGoogle(): Promise<AuthResponse | null> {
    setError("");
    if (Platform.OS === "web") {
      await promptAsync();
      return null; // result delivered via useEffect / onSuccess callback
    }
    return signInWithGoogleNative();
  }

  return {
    configured,
    loading,
    error,
    signInWithGoogle,
  };
}
