import { Stack } from "expo-router";
import { colors } from "../../lib/colors";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activity/[id]" />
      <Stack.Screen name="activity/respond/[id]" />
      <Stack.Screen name="activity/respond/text" />
      <Stack.Screen name="activity/respond/audio" />
      <Stack.Screen name="activity/respond/video" />
      <Stack.Screen name="activity/respond/drawing" />
      <Stack.Screen name="activity/respond/oral" />
      <Stack.Screen name="activity/respond/quiz" />
      <Stack.Screen name="activity/respond/presentation" />
      <Stack.Screen name="activity/respond/podcast" />
      <Stack.Screen name="activity/submit/[id]" />
      <Stack.Screen name="create/index" />
      <Stack.Screen name="accessibility/index" />
      <Stack.Screen name="privacy/index" />
    </Stack>
  );
}
