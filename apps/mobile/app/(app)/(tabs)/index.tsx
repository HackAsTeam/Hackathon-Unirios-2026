import { View, Text } from "react-native";
import { useAuthStore } from "../../../store/auth";

export default function HomeScreen() {
  const userId = useAuthStore((s) => s.userId);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold mb-2">Home</Text>
      <Text className="text-gray-500 text-sm">userId: {userId}</Text>
    </View>
  );
}
