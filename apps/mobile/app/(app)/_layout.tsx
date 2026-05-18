import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useAuthStore } from "../../store/auth";
import { useAccessibilityStore } from "../../store/acessibility";
import { useOnboardingStore } from "../../store/onboarding";
import { VoiceAssistantButton } from "../../components/voice/VoiceAssistantButton";

export default function AppLayout() {
  const { isSignedIn, hydrated } = useAuthStore();
  const pathname = usePathname();
  const isLegalRoute = pathname === '/privacy' || pathname === '/terms' || pathname === '/consent';
  const hideVoiceButton = pathname === '/onboarding' || isLegalRoute;

  useEffect(() => {
    useAccessibilityStore.getState().load();
    useOnboardingStore.getState().load();
  }, []);

  if (!hydrated) return null;
  if (!isSignedIn && !isLegalRoute) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {!hideVoiceButton && <VoiceAssistantButton />}
    </View>
  );
}
