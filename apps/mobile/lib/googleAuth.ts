import { useState } from "react";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { apiFetch } from "./api";
import { useAuthStore } from "../store/auth";

type AuthResponse = {
  userId: string;
  token: string;
};

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
});

export function useGoogleSignIn() {
  const signIn = useAuthStore((state) => state.signIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const configured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  async function signInWithGoogle() {
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

      await signIn(data.userId, data.token);
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
      const message = err instanceof Error ? err.message : "Erro ao entrar com Google";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    configured,
    loading,
    error,
    signInWithGoogle,
  };
}
