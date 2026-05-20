import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { useOnboardingStore } from '../store/onboarding';
import { landingRouteForRole } from '../lib/routes';

export default function IndexRedirect() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const { loaded, completed, load, role: onboardingRole } = useOnboardingStore();
  const authRole = useAuthStore((s) => s.role);

  useEffect(() => {
    load();
  }, []);

  if (!hydrated || !loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-400">Carregando...</Text>
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (!completed) return <Redirect href="/onboarding" />;

  const role = onboardingRole ?? authRole;
  return <Redirect href={landingRouteForRole(role)} />;
}
