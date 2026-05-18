import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "../../store/auth";
import { apiFetch } from "../../lib/api";
import { useGoogleSignIn } from "../../lib/googleAuth";
import { AppScreen } from "../../components/AppScreen";
import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";

export default function SignUpScreen() {
  const { signIn } = useAuthStore();
  const google = useGoogleSignIn(() => router.replace("/onboarding"));
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ userId: string; email: string | null; displayName: string | null; avatarUrl: string | null; token: string; role: string }>(
        "/auth/register",
        { method: "POST", body: { email, password, displayName } },
      );
      await signIn(data.userId, data.token, data.email, data.displayName, data.avatarUrl, data.role);
      router.replace("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    const data = await google.signInWithGoogle();
    if (data) {
      router.replace("/onboarding");
    }
  }

  return (
    <AppScreen>
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-green-900 mb-2">
          Criar conta
        </Text>
        <Text className="text-gray-500 mb-8">
          Preencha os dados para se cadastrar
        </Text>

        <AppInput
          label="Nome"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />

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
          <AppButton
            label="Cadastrar"
            onPress={handleSignUp}
            loading={loading}
          />
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
            accessibilityHint="Cadastrar usando sua conta Google"
          />
        </View>

        <Link href="/(auth)/sign-in" className="text-center text-green-700">
          Já tem conta? Entre
        </Link>

        <Text className="text-gray-400 text-xs text-center mt-6 leading-5">
          Ao se cadastrar, você concorda com nossos{' '}
          <Link href="/terms" className="text-green-600 underline">Termos de Uso</Link>
          {' '}e{' '}
          <Link href="/privacy" className="text-green-600 underline">Política de Privacidade</Link>.
        </Text>
      </View>
    </AppScreen>
  );
}
