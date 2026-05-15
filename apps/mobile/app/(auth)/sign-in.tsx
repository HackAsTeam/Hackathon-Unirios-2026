import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "../../store/auth";
import { apiFetch } from "../../lib/api";

export default function SignInScreen() {
  const { signIn } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ userId: string; token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: { email, password },
        },
      );
      signIn(data.userId, data.token);
      router.replace("/(app)/(tabs)");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-8 text-center">Entrar</Text>

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? (
        <Text className="text-red-500 mb-4 text-sm">{error}</Text>
      ) : null}

      <TouchableOpacity
        className="bg-black rounded-lg py-4 items-center mb-4"
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text className="text-white font-semibold text-base">
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/sign-up" className="text-center text-gray-500">
        Não tem conta? Cadastre-se
      </Link>
    </View>
  );
}
