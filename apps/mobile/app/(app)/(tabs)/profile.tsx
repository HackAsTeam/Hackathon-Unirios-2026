import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/auth";
import { useAccessibilityStore, type DefaultResponseFormat } from "../../../store/acessibility";
import { Image, ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import { colors } from "../../../lib/colors";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-gray-500 text-base">{label}</Text>
      <Text className="text-black text-base font-medium">{value}</Text>
    </View>
  );
}

function Avatar({ displayName, avatarUrl }: { displayName: string | null; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} className="w-20 h-20 rounded-full mb-3" style={{ objectFit: "cover" }} />;
  }
  return (
    <View className="w-20 h-20 rounded-full bg-black items-center justify-center mb-3">
      <Text className="text-white text-3xl font-bold">
        {(displayName ?? "U").charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const FORMAT_OPTIONS: { value: DefaultResponseFormat; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'audio', label: 'Áudio' },
  { value: 'oral', label: 'Oral' },
];

const FONT_OPTIONS: { value: number; label: string }[] = [
  { value: 0.85, label: 'A-' },
  { value: 1.0, label: 'A' },
  { value: 1.2, label: 'A+' },
  { value: 1.4, label: 'A++' },
];

export default function ProfileScreen() {
  const { userId, email, displayName, avatarUrl, signOut } = useAuthStore();
  const {
    defaultResponseFormat,
    setDefaultResponseFormat,
    fontSizeScale,
    setFontSizeScale,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  } = useAccessibilityStore();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/sign-in");
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-6 items-center border-b border-gray-100">
        <Avatar displayName={displayName} avatarUrl={avatarUrl} />
        <Text className="text-2xl font-bold">{displayName ?? "Usuário"}</Text>
      </View>

      <View className="px-6 py-6">
        <Text className="text-lg font-semibold mb-2">Informações Pessoais</Text>
        <View className="border border-gray-200 rounded-xl px-4">
          <InfoRow label="Nome" value={displayName ?? "—"} />
          <View className="h-px bg-gray-100" />
          <InfoRow label="Email" value={email ?? "—"} />
        </View>
      </View>

      <View className="px-6 py-4">
        <Text className="text-lg font-semibold mb-3">Acessibilidade</Text>
        <View className="border border-gray-200 rounded-xl px-4 py-4 gap-5">

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              Formato padrão de resposta
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FORMAT_OPTIONS.map((opt) => {
                const isActive = defaultResponseFormat === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setDefaultResponseFormat(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={opt.label}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive ? colors.surfaceAlt : colors.surface,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isActive ? colors.primary : colors.text.secondary }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              Tamanho da fonte
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FONT_OPTIONS.map((opt) => {
                const isActive = Math.abs(fontSizeScale - opt.value) < 0.05;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setFontSizeScale(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`Fonte ${opt.label}`}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive ? colors.surfaceAlt : colors.surface,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: opt.value * 14, fontWeight: '700', color: isActive ? colors.primary : colors.text.secondary }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>Alto contraste</Text>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
              accessibilityLabel="Alto contraste"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>Reduzir animações</Text>
            <Switch
              value={reducedMotion}
              onValueChange={setReducedMotion}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
              accessibilityLabel="Reduzir animações"
            />
          </View>
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

      <View className="px-6 py-4 pb-12 gap-3">
        <TouchableOpacity
          className="border border-gray-300 rounded-xl py-4 items-center active:opacity-60"
          onPress={handleSignOut}
        >
          <Text className="text-gray-700 font-semibold text-base">Sair</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-red-400 rounded-xl py-4 items-center opacity-50"
          disabled={true}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-red-500 font-semibold text-base">Excluir Conta e Dados</Text>
            <Text className="text-red-400 text-xs font-medium">Em breve</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
