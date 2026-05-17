import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "../../store/auth";
import { useOnboardingStore } from "../../store/onboarding";
import { apiFetch } from "../../lib/api";
import { useGoogleSignIn } from "../../lib/googleAuth";
import { AppScreen } from "../../components/AppScreen";
import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";

export default function SignInScreen() {
  const { signIn } = useAuthStore();
  const pendingInviteToken = useAuthStore((s) => s.pendingInviteToken);
  const setPendingInviteToken = useAuthStore((s) => s.setPendingInviteToken);
  const router = useRouter();

  function redirectAfterLogin() {
    if (pendingInviteToken) {
      const t = pendingInviteToken;
      setPendingInviteToken(null);
      router.replace(`/invite/${t}` as never);
    } else {
      const { completed } = useOnboardingStore.getState();
      router.replace(completed ? "/(app)/(tabs)" : "/onboarding");
    }
  }

  const google = useGoogleSignIn(redirectAfterLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ userId: string; email: string | null; displayName: string | null; avatarUrl: string | null; token: string; role: string }>(
        "/auth/login",
        { method: "POST", body: { email, password } },
      );
      await signIn(data.userId, data.token, data.email, data.displayName, data.avatarUrl, data.role);
      redirectAfterLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    const data = await google.signInWithGoogle();
    if (data) {
      redirectAfterLogin();
    }
  }

  return (
    <AppScreen>
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-green-900 mb-2">
          Bem-vindo
        </Text>
        <Text className="text-gray-500 mb-8">
          Entre na sua conta para continuar
        </Text>

        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <AppInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text
            className="text-red-600 text-sm mb-4 -mt-2"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        ) : null}

        <View className="mb-4">
          <AppButton label="Entrar" onPress={handleSignIn} loading={loading} />
        </View>

        {google.error ? (
          <Text
            className="text-red-600 text-sm mb-3 text-center"
            accessibilityLiveRegion="polite"
          >
            {google.error}
          </Text>
        ) : null}

        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-green-200" />
          <Text className="text-gray-400 text-sm mx-3">ou</Text>
          <View className="flex-1 h-px bg-green-200" />
        </View>

        <View className="mb-6">
          <AppButton
            label="Continuar com Google"
            onPress={handleGoogleSignIn}
            loading={google.loading}
            disabled={!google.configured}
            variant="outline"
            accessibilityHint="Entrar usando sua conta Google"
          />
        </View>

        <Link href="/(auth)/sign-up" className="text-center text-green-700">
          Não tem conta? Cadastre-se
        </Link>
      </View>
    </AppScreen>
  );
}
