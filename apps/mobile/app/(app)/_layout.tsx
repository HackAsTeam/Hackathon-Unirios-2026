import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../store/auth";

export default function AppLayout() {
  const { isSignedIn, hydrated } = useAuthStore();

  if (!hydrated) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
