import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "@/store/onboarding";
import { useAuthStore } from "@/store/auth";
import { useColors } from "@/hooks/useColors";

export default function TabsLayout() {
  const onboardingRole = useOnboardingStore((s) => s.role);
  const authRole = useAuthStore((s) => s.role?.toLowerCase() ?? null);
  const role = onboardingRole ?? authRole;
  const c = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: c.primaryLight,
          backgroundColor: c.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarAccessibilityLabel: "Início",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Resultados",
          tabBarLabel: "Resultados",
          tabBarAccessibilityLabel: "Meus resultados",
          href: role === 'student' ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pendencias"
        options={{
          title: 'Pendências',
          tabBarLabel: 'Pendências',
          tabBarAccessibilityLabel: 'Minhas pendências',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarAccessibilityLabel: "Meu perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
