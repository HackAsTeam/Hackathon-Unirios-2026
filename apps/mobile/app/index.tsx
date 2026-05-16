import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { useOnboardingStore } from '../store/onboarding';

export default function IndexRedirect() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const { loaded, completed, load } = useOnboardingStore();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!hydrated || !loaded) return;

    if (isSignedIn) {
      if (completed) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } else {
      router.replace('/(auth)/sign-in');
    }
  }, [hydrated, loaded, isSignedIn, completed]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg text-gray-400">Carregando...</Text>
    </View>
  );
}
