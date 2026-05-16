import { TouchableOpacity, View, Text } from 'react-native';
import { colors } from '../../lib/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: Record<string, unknown>;
  variant?: 'default' | 'elevated' | 'outlined' | 'colored';
  color?: string;
  colorLight?: string;
  accessibilityLabel?: string;
}

const baseStyle = {
  borderRadius: 20,
  padding: 20,
};

export function Card({
  children,
  onPress,
  style,
  variant = 'default',
  color,
  colorLight,
  accessibilityLabel,
}: CardProps) {
  const variantStyle = {
    default: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    elevated: {
      backgroundColor: colors.surface,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 4,
    },
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: color || colors.border,
    },
    colored: {
      backgroundColor: colorLight || colors.surfaceAlt,
      borderWidth: 1,
      borderColor: color || 'transparent',
    },
  };

  const content = (
    <View
      style={{
        ...baseStyle,
        ...variantStyle[variant],
        ...style,
      }}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
