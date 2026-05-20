import type { Href } from 'expo-router';

export function landingRouteForRole(role: string | null | undefined): Href {
  if (role?.toLowerCase() === 'student') {
    return '/(app)/(tabs)/pendencias';
  }
  return '/(app)/(tabs)';
}
