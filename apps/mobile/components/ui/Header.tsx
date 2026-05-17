import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Header({ title, subtitle, showBack = false, rightAction, accessibilityLabel }: HeaderProps) {
  const router = useRouter();
  const c = useColors();
  const scale = useScale();

  return (
    <View
      style={{
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 24,
        backgroundColor: c.background,
        borderBottomWidth: 1,
        borderBottomColor: c.borderLight,
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
                backgroundColor: c.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: c.borderLight,
              }}
            >
              <Ionicons name="arrow-back" size={20} color={c.text.primary} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: scale(24),
                fontWeight: '700',
                color: c.text.primary,
                letterSpacing: -0.5,
              }}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: scale(14),
                  color: c.text.secondary,
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
