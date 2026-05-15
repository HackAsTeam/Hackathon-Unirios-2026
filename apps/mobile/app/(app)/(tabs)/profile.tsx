import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../../lib/colors';
import { MOCK_STUDENT } from '../../../lib/mock-data';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAccessibilityStore } from '../../../store/accessibility';

const menuItems: { icon: string; title: string; desc: string; route: string }[] = [
  { icon: '♿', title: 'Acessibilidade', desc: 'Ajustes de fonte, contraste e mais', route: '/(app)/accessibility' },
  { icon: '🔒', title: 'Privacidade e LGPD', desc: 'Seus dados, seu controle', route: '/(app)/privacy' },
  { icon: '📊', title: 'Meu Progresso', desc: 'Histórico de atividades e conquistas', route: '#' },
  { icon: '💬', title: 'Feedback', desc: 'Veja o que seus professores disseram', route: '#' },
  { icon: '⚙️', title: 'Configurações', desc: 'Preferências do app', route: '#' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { fontSizeScale } = useAccessibilityStore();
  const user = MOCK_STUDENT;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 24,
          alignItems: 'center',
          gap: 12,
        }}>
          <View style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: colors.primaryLight + '40',
          }}>
            <Text style={{ fontSize: 36, fontWeight: '700', color: '#fff' }}>
              {user.name.charAt(0)}
            </Text>
          </View>
          <Text style={{
            fontSize: Math.round(24 * fontSizeScale),
            fontWeight: '700',
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}>
            {user.name}
          </Text>
          <Text style={{ fontSize: 14, color: colors.text.tertiary }}>
            {user.email}
          </Text>
          <Text style={{
            backgroundColor: colors.primary + '12',
            borderRadius: 100,
            paddingHorizontal: 14,
            paddingVertical: 4,
            fontSize: 13,
            fontWeight: '600',
            color: colors.primary,
            overflow: 'hidden',
          }}>
            Membro desde {user.createdAt}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, gap: 16 }}>
          <Card variant="elevated">
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>5</Text>
                <Text style={{ fontSize: 13, color: colors.text.secondary }}>Atividades</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.success }}>3</Text>
                <Text style={{ fontSize: 13, color: colors.text.secondary }}>Completas</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.formats.oral }}>4</Text>
                <Text style={{ fontSize: 13, color: colors.text.secondary }}>Formatos</Text>
              </View>
            </View>
          </Card>

          <View style={{ gap: 8 }}>
            <Text style={{
              fontSize: Math.round(16 * fontSizeScale),
              fontWeight: '700',
              color: colors.text.primary,
              letterSpacing: -0.3,
            }}>
              Seu Espaço
            </Text>
            <View style={{ gap: 8 }}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => item.route !== '#' ? (router.push as (s: string) => void)(item.route) : undefined}
                  accessibilityLabel={item.title}
                  accessibilityRole="button"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 1 }}>
                      {item.desc}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
