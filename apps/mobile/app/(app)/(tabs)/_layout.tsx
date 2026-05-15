import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { colors } from "../../../lib/colors";
import { useAccessibilityStore } from "../../../store/accessibility";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.primary + '12' : 'transparent',
      }}
    >
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { highContrast } = useAccessibilityStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: highContrast ? '#000' : colors.surface,
          paddingTop: 8,
          paddingBottom: 24,
          height: 80,
          elevation: 0,
          shadowOpacity: 0,
          borderTopColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: -0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarLabel: "Início",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
