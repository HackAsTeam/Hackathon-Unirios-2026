import { Tabs } from "expo-router";

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
        options={{ title: "Home", tabBarLabel: "Home" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarLabel: "Perfil" }}
      />
    </Tabs>
  );
}
