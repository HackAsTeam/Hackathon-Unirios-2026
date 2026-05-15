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
});

export function useGoogleSignIn() {
  const signIn = useAuthStore((state) => state.signIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const configured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    console.log("[GoogleAuth] signInWithGoogle started");

    try {
      console.log("[GoogleAuth] checking Play Services...");
      await GoogleSignin.hasPlayServices();
      console.log("[GoogleAuth] Play Services OK, calling signIn...");

      const response = await GoogleSignin.signIn();
      console.log("[GoogleAuth] signIn response:", JSON.stringify(response));

      const idToken = response.data?.idToken;
      console.log("[GoogleAuth] idToken present:", Boolean(idToken));

      if (!idToken) {
        console.warn("[GoogleAuth] no idToken in response");
        setError("Google não retornou um token de identidade.");
        return null;
      }

      console.log("[GoogleAuth] calling /auth/google on backend...");
      const data = await apiFetch<AuthResponse>("/auth/google", {
        method: "POST",
        body: { idToken },
      });
      console.log("[GoogleAuth] backend response:", JSON.stringify(data));

      await signIn(data.userId, data.token);
      console.log("[GoogleAuth] signIn complete, userId:", data.userId);
      return data;
    } catch (err: unknown) {
      if (isErrorWithCode(err)) {
        console.error("[GoogleAuth] error with code:", err.code, err);
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log("[GoogleAuth] user cancelled");
          return null;
        }
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.error("[GoogleAuth] Play Services not available");
          setError("Google Play Services não disponível.");
          return null;
        }
      }
      console.error("[GoogleAuth] unknown error:", err);
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
