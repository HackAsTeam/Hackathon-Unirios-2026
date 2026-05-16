import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../lib/colors';
import { useAccessibilityStore } from '@/store/acessibility';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Header({ title, subtitle, showBack = false, rightAction, accessibilityLabel }: HeaderProps) {
  const router = useRouter();
  const { fontSizeScale } = useAccessibilityStore();

  return (
    <View
      style={{
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 24,
        backgroundColor: colors.background,
      }}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="header"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text style={{ fontSize: 20, color: colors.text.primary }}>←</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: Math.round(24 * fontSizeScale),
                fontWeight: '700',
                color: colors.text.primary,
                letterSpacing: -0.5,
              }}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: Math.round(14 * fontSizeScale),
                  color: colors.text.secondary,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightAction}
      </View>
    </View>
  );
}
