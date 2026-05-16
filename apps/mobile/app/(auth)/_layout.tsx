import { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { useOnboardingStore } from "../../store/onboarding";

export default function AuthLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const { loaded, completed, load } = useOnboardingStore();

  useEffect(() => {
    load();
  }, []);

  if (hydrated && isSignedIn) {
    if (!loaded) return null;
    if (completed) return <Redirect href="/(app)/(tabs)" />;
    return <Redirect href="/onboarding" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
