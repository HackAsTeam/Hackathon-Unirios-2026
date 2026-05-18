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
  const hideVoiceButton = pathname === '/onboarding';

  useEffect(() => {
    useAccessibilityStore.getState().load();
    useOnboardingStore.getState().load();
  }, []);

  if (!hydrated) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {!hideVoiceButton && <VoiceAssistantButton />}
    </View>
  );
}
