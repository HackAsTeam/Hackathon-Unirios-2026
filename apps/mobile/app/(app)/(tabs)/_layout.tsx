import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/colors";
import { useOnboardingStore } from "@/store/onboarding";

export default function TabsLayout() {
  const role = useOnboardingStore((s) => s.role);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.primaryLight,
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarLabel: "Home", tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ) }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Resultados",
          tabBarLabel: "Resultados",
          href: role === 'student' ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarLabel: "Perfil", tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" size={size} color={color} />
        ) }}
      />
    </Tabs>
  );
}
