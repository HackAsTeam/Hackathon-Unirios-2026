import { useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { apiFetch } from "./api";
import { useAuthStore } from "../store/auth";

WebBrowser.maybeCompleteAuthSession();

type AuthResponse = {
  userId: string;
  token: string;
};

export function useGoogleSignIn() {
  const signIn = useAuthStore((state) => state.signIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const activeClientId = Platform.select({
    android: androidClientId,
    ios: iosClientId,
    default: webClientId,
  }) || webClientId;
  const configured = Boolean(activeClientId);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: webClientId,
    androidClientId: androidClientId || webClientId,
    iosClientId: iosClientId || webClientId,
    selectAccount: true,
  });

  async function signInWithGoogle() {
    setError("");

    if (!configured) {
      setError("Configure o client ID do Google para esta plataforma.");
      return null;
    }

    setLoading(true);

    try {
      const result = await promptAsync();
      if (result.type !== "success") {
        if (result.type === "error") {
          setError(result.error?.message ?? "Erro ao entrar com Google");
        }

        return null;
      }

      const idToken = result.params.id_token;
      if (!idToken) {
        setError("Google não retornou um token de identidade.");
        return null;
      }

      const data = await apiFetch<AuthResponse>("/auth/google", {
        method: "POST",
        body: { idToken },
      });

      await signIn(data.userId, data.token);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao entrar com Google";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    request,
    configured,
    loading,
    error,
    signInWithGoogle,
  };
}
