import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/onboarding';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';

interface AuthResponse {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  token: string;
  role: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completed, setRole } = useOnboardingStore();
  const { token, userId, email, displayName, avatarUrl, signIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (completed) {
      router.replace('/(app)/(tabs)');
    }
  }, [completed]);

  if (completed) return null;

  async function handleRoleSelect(role: 'teacher' | 'student') {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AuthResponse>('/auth/me/role', {
        method: 'PUT',
        token: token!,
        body: { role },
      });
      await signIn(data.userId, data.token, data.email, data.displayName, data.avatarUrl, data.role);
      await setRole(role);
      router.replace('/(app)/(tabs)');
    } catch (e: any) {
      setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-20 pb-8">
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-black mb-2">Placeholder</Text>
          <Text className="text-base text-gray-400 text-center">
            A plataforma que transforma a maneira de avaliar
          </Text>
        </View>
      </View>

      <View className="h-full justify-center px-6 pb-12 gap-3">
        {error && (
          <Text className="text-red-500 text-center mb-2">{error}</Text>
        )}

        <TouchableOpacity
          className="bg-black rounded-2xl py-5 items-center"
          onPress={() => handleRoleSelect('teacher')}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg">Sou Professor</Text>
              <Text className="text-gray-400 text-sm mt-1">Criar e gerenciar turmas</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="border-2 border-black rounded-2xl py-5 items-center"
          onPress={() => handleRoleSelect('student')}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Text className="text-black font-bold text-lg">Sou Aluno</Text>
              <Text className="text-gray-500 text-sm mt-1">Participar de turmas</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
