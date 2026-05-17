import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { useAccessibilityStore } from "../../store/acessibility";

export default function AppLayout() {
  const { isSignedIn, hydrated } = useAuthStore();

  useEffect(() => {
    useAccessibilityStore.getState().load();
  }, []);

  if (!hydrated) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
