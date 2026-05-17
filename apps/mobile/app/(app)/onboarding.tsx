import { useRef, useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
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

const slides = [
  {
    icon: 'school' as const,
    title: 'Bem-vindo',
    description:
      'A plataforma que transforma a maneira de avaliar com tecnologia e acessibilidade.',
  },
  {
    icon: 'assignment' as const,
    title: 'Atividades Interativas',
    description:
      'Responda com texto, áudio ou comandos de voz. Escolha o formato ideal para você.',
  },
  {
    icon: 'accessibility' as const,
    title: 'Acessibilidade',
    description:
      'Ajuste fonte, contraste e ative o assistente de voz para navegar sem usar as mãos.',
  },
  {
    icon: 'people' as const,
    title: 'Professores e Alunos',
    description:
      'Crie turmas, gerencie atividades e acompanhe resultados em tempo real.',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { completed, setRole } = useOnboardingStore();
  const { token, signIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isLastSlide = currentIndex === slides.length - 1;

  useEffect(() => {
    if (completed) {
      router.replace('/(app)/(tabs)');
    }
  }, [completed]);

  if (completed) return null;

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }

  function handlePrev() {
    const prev = Math.max(0, currentIndex - 1);
    scrollRef.current?.scrollTo({ x: prev * width, animated: true });
    setCurrentIndex(prev);
  }

  function handleSkipOrContinue() {
    setShowRolePicker(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }

  async function handleRoleSelect(role: 'teacher' | 'student') {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AuthResponse>('/auth/me/role', {
        method: 'PUT',
        token: token!,
        body: { role },
      });
      await signIn(
        data.userId,
        data.token,
        data.email,
        data.displayName,
        data.avatarUrl,
        data.role,
      );
      await setRole(role);
      router.replace('/(app)/(tabs)');
    } catch {
      setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      {!showRolePicker ? (
        <>
          <View className="flex-1 pt-20">
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              className="flex-1"
            >
              {slides.map((slide, index) => (
                <View key={index} style={{ width }} className="flex-1 px-8">
                  <View className="flex-1 items-center justify-center">
                    <View className="mb-10 h-28 w-28 items-center justify-center rounded-full bg-green-50">
                      <MaterialIcons name={slide.icon} size={48} color="#16a34a" />
                    </View>
                    <Text className="mb-4 text-center text-2xl font-bold text-black">
                      {slide.title}
                    </Text>
                    <Text className="max-w-xs text-center text-base leading-6 text-gray-500">
                      {slide.description}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            onPress={handleSkipOrContinue}
            className="absolute right-6 top-16"
          >
            <Text className="text-sm text-gray-400">
              {isLastSlide ? 'Continuar' : 'Pular'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center pb-12">
            {currentIndex > 0 && (
              <TouchableOpacity onPress={handlePrev} className="mr-4 p-1">
                <MaterialIcons name="chevron-left" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
            <View className="flex-row gap-2">
              {slides.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-green-600' : 'bg-gray-300'}`}
                />
              ))}
            </View>
          </View>
        </>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView className="flex-1 bg-white">
            <View className="px-6 pt-20 pb-8">
              <View className="mb-12 items-center">
                <Text className="mb-2 text-3xl font-bold text-black">
                  Quem é você?
                </Text>
                <Text className="text-center text-base text-gray-400">
                  Escolha como deseja usar a plataforma
                </Text>
              </View>
            </View>

            <View className="h-full justify-center gap-3 px-6 pb-12">
              {error && (
                <Text className="mb-2 text-center text-red-500">{error}</Text>
              )}

              <TouchableOpacity
                className="items-center rounded-2xl bg-green-600 py-5"
                onPress={() => handleRoleSelect('teacher')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-lg font-bold text-white">
                      Sou Professor
                    </Text>
                    <Text className="mt-1 text-sm text-gray-200">
                      Criar e gerenciar turmas
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center rounded-2xl border-2 border-green-600 py-5"
                onPress={() => handleRoleSelect('student')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#16a34a" />
                ) : (
                  <>
                    <Text className="text-lg font-bold text-green-600">
                      Sou Aluno
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                      Participar de turmas
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}
