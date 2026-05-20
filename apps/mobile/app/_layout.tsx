import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import tamaguiConfig from '../tamagui.config';
import { useAuthStore } from '../store/auth';
import { useAccessibilityStore } from '@/store/acessibility';

const queryClient = new QueryClient();

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const {highContrast} = useAccessibilityStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <StatusBar style={highContrast ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
