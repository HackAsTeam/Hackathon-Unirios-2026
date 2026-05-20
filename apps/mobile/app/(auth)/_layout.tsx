import { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { useOnboardingStore } from "../../store/onboarding";
import { landingRouteForRole } from "../../lib/routes";

export default function AuthLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const { loaded, completed, load, role: onboardingRole } = useOnboardingStore();
  const authRole = useAuthStore((s) => s.role);

  useEffect(() => {
    load();
  }, []);

  if (hydrated && isSignedIn) {
    if (!loaded) return null;
    if (completed) {
      const role = onboardingRole ?? authRole;
      return <Redirect href={landingRouteForRole(role)} />;
    }
    return <Redirect href="/onboarding" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
