import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../store/auth";

export default function AuthLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  if (hydrated && isSignedIn) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
