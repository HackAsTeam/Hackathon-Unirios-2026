import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { borderTopWidth: 1, borderTopColor: "#eee" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarLabel: "Home", tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ) }}
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
