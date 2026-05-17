import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useAuthStore } from "../../store/auth";
import { useAccessibilityStore } from "../../store/acessibility";
import { useOnboardingStore } from "../../store/onboarding";
import { VoiceAssistantButton } from "../../components/voice/VoiceAssistantButton";

export default function AppLayout() {
  const { isSignedIn, hydrated } = useAuthStore();

  useEffect(() => {
    useAccessibilityStore.getState().load();
    useOnboardingStore.getState().load();
  }, []);

  if (!hydrated) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <VoiceAssistantButton />
    </View>
  );
}
