// import { useRouter } from "expo-router";
// import { useAuthStore } from "../../../store/auth";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

const MOCK_USER = {
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "(84) 99999-8888",
  createdAt: "Janeiro 2025",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-gray-500 text-base">{label}</Text>
      <Text className="text-black text-base font-medium">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  // const { signOut } = useAuthStore();
  // const router = useRouter();

  // async function handleSignOut() {
  //   await signOut();
  //   router.replace("/(auth)/sign-in");
  // }
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-6 items-center border-b border-gray-100">
        <View className="w-20 h-20 rounded-full bg-black items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">
            {MOCK_USER.name.charAt(0)}
          </Text>
        </View>
        <Text className="text-2xl font-bold">{MOCK_USER.name}</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Membro desde {MOCK_USER.createdAt}
        </Text>
      </View>

      <View className="px-6 py-6">
        <Text className="text-lg font-semibold mb-2">Informações Pessoais</Text>
        <View className="border border-gray-200 rounded-xl px-4">
          <InfoRow label="Nome" value={MOCK_USER.name} />
          <View className="h-px bg-gray-100" />
          <InfoRow label="Email" value={MOCK_USER.email} />
          <View className="h-px bg-gray-100" />
          <InfoRow label="Telefone" value={MOCK_USER.phone} />
          <View className="h-px bg-gray-100" />
        </View>
      </View>

      <View className="px-6 py-4">
        <Text className="text-lg font-semibold mb-2">Privacidade & LGPD</Text>
        <View className="border border-gray-200 rounded-xl overflow-hidden">
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 active:opacity-60">
            <Text className="text-base">Política de Privacidade</Text>
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
          <View className="h-px bg-gray-100 mx-4" />
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 active:opacity-60">
            <Text className="text-base">Termos de Uso</Text>
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
          <View className="h-px bg-gray-100 mx-4" />
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 active:opacity-60">
            <Text className="text-base">Consentimento de Dados</Text>
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 py-4 pb-12">
        <TouchableOpacity
          className="border border-red-400 rounded-xl py-4 items-center active:opacity-60"
          onPress={() => {}}
        >
          <Text className="text-red-500 font-semibold text-base">
            Excluir Conta e Dados
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
