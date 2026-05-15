import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/auth";

export default function ProfileScreen() {
  const { signOut } = useAuthStore();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.replace("/(auth)/sign-in");
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8">Perfil</Text>

      <TouchableOpacity
        className="bg-red-500 rounded-lg py-4 px-8 items-center"
        onPress={handleSignOut}
      >
        <Text className="text-white font-semibold">Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
