import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/auth";
import { useOnboardingStore } from "../../../store/onboarding";
import { signOutFromGoogle } from "../../../lib/googleAuth";
import { useAccessibilityStore, type DefaultResponseFormat } from "../../../store/acessibility";
import { useScreenContext } from "../../../hooks/useScreenContext";
import { Alert, Image, ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch } from "../../../lib/api";
import { useColors } from "../../../hooks/useColors";
import { useScale } from "../../../hooks/useScale";

function InfoRow({ label, value }: { label: string; value: string }) {
  const c = useColors();
  const scale = useScale();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
      <Text style={{ color: c.text.secondary, fontSize: scale(16) }}>{label}</Text>
      <Text style={{ color: c.text.primary, fontSize: scale(16), fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

function Avatar({ displayName, avatarUrl }: { displayName: string | null; avatarUrl: string | null }) {
  const c = useColors();
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12, objectFit: 'cover' }} />;
  }
  return (
    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700' }}>
        {(displayName ?? 'U').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const FORMAT_OPTIONS: { value: DefaultResponseFormat; label: string }[] = [
  { value: 'quiz', label: 'Múltipla Escolha' },
  { value: 'text', label: 'Texto' },
  { value: 'audio', label: 'Áudio' },
];

const FONT_OPTIONS: { value: number; label: string }[] = [
  { value: 0.85, label: 'A-' },
  { value: 1.0, label: 'A' },
  { value: 1.2, label: 'A+' },
  { value: 1.4, label: 'A++' },
];

export default function ProfileScreen() {
  const { userId, token, email, displayName, avatarUrl, signOut, role } = useAuthStore();
  useScreenContext({ screen: 'profile', role: role as 'teacher' | 'student' | undefined });
  const {
    defaultResponseFormat,
    setDefaultResponseFormat,
    fontSizeScale,
    setFontSizeScale,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    wakeWordEnabled,
    setWakeWordEnabled,
  } = useAccessibilityStore();
  const router = useRouter();
  const c = useColors();
  const scale = useScale();

  async function handleSignOut() {
    await Promise.all([signOut(), useOnboardingStore.getState().reset(), signOutFromGoogle()]);
    router.replace("/(auth)/sign-in");
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Excluir conta?",
      "Sua conta ficará em período de carência por 30 dias. Durante esse tempo você poderá restaurá-la ao tentar entrar novamente. Após esse prazo, seus dados pessoais serão anonimizados permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Solicitar exclusão",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch("/auth/me", { method: "DELETE", token: token ?? undefined });
              await Promise.all([signOut(), useOnboardingStore.getState().reset(), signOutFromGoogle()]);
              router.replace("/(auth)/sign-in");
            } catch {
              Alert.alert("Erro", "Não foi possível excluir a conta. Tente novamente.");
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
    <ScrollView>
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.borderLight,
      }}>
        <Avatar displayName={displayName} avatarUrl={avatarUrl} />
        <Text style={{ fontSize: scale(24), fontWeight: '700', color: c.text.primary }}>{displayName ?? 'Usuário'}</Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
        <Text style={{ fontSize: scale(18), fontWeight: '600', color: c.text.primary, marginBottom: 8 }}>Informações Pessoais</Text>
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16 }}>
          <InfoRow label="Nome" value={displayName ?? '—'} />
          <View style={{ height: 1, backgroundColor: c.borderLight }} />
          <InfoRow label="Email" value={email ?? '—'} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ fontSize: scale(18), fontWeight: '600', color: c.text.primary, marginBottom: 12 }}>Acessibilidade</Text>
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, gap: 20 }}>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.text.primary }}>
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
                      borderColor: isActive ? c.primary : c.border,
                      backgroundColor: isActive ? c.surfaceAlt : c.surface,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: scale(13), fontWeight: '700', color: isActive ? c.primary : c.text.secondary }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.text.primary }}>
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
                      borderColor: isActive ? c.primary : c.border,
                      backgroundColor: isActive ? c.surfaceAlt : c.surface,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: opt.value * 14, fontWeight: '700', color: isActive ? c.primary : c.text.secondary }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.text.primary }}>Alto contraste</Text>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ true: c.primary, false: c.border }}
              thumbColor="#fff"
              accessibilityLabel="Alto contraste"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.text.primary }}>Reduzir animações</Text>
            <Switch
              value={reducedMotion}
              onValueChange={setReducedMotion}
              trackColor={{ true: c.primary, false: c.border }}
              thumbColor="#fff"
              accessibilityLabel="Reduzir animações"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.text.primary }}>
                Assistente "Hey Dillo"
              </Text>
              <Text style={{ fontSize: scale(12), color: c.text.secondary, marginTop: 2 }}>
                Fique ouvindo o comando de voz em todo o app
              </Text>
            </View>
            <Switch
              value={wakeWordEnabled}
              onValueChange={setWakeWordEnabled}
              trackColor={{ true: c.primary, false: c.border }}
              thumbColor="#fff"
              accessibilityLabel='Assistente de voz Hey Dillo sempre ativo'
              accessibilityHint='Quando ativo, diga Hey Dillo a qualquer momento para abrir o assistente'
            />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ fontSize: scale(18), fontWeight: '600', color: c.text.primary, marginBottom: 8 }}>Privacidade & LGPD</Text>
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, overflow: 'hidden' }}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => router.push('/privacy')}
            accessibilityLabel="Política de Privacidade"
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 }}
          >
            <Text style={{ fontSize: scale(16), color: c.text.primary }}>Política de Privacidade</Text>
            <Text style={{ color: c.text.tertiary, fontSize: scale(18) }}>›</Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: c.borderLight, marginHorizontal: 16 }} />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => router.push('/terms')}
            accessibilityLabel="Termos de Uso"
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 }}
          >
            <Text style={{ fontSize: scale(16), color: c.text.primary }}>Termos de Uso</Text>
            <Text style={{ color: c.text.tertiary, fontSize: scale(18) }}>›</Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: c.borderLight, marginHorizontal: 16 }} />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => router.push('/consent')}
            accessibilityLabel="Consentimento de Dados"
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 }}
          >
            <Text style={{ fontSize: scale(16), color: c.text.primary }}>Consentimento de Dados</Text>
            <Text style={{ color: c.text.tertiary, fontSize: scale(18) }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 48, gap: 12 }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleSignOut}
          accessibilityLabel="Sair da conta"
          accessibilityRole="button"
          style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: c.text.secondary, fontWeight: '600', fontSize: scale(16) }}>Sair</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleDeleteAccount}
          accessibilityLabel="Excluir conta e dados"
          accessibilityRole="button"
          style={{ borderWidth: 1, borderColor: c.error, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: c.error, fontWeight: '600', fontSize: scale(16) }}>Excluir Conta e Dados</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
