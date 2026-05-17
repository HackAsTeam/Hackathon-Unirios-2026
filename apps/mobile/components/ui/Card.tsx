import { TouchableOpacity, View, Text } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: Record<string, unknown>;
  variant?: 'default' | 'elevated' | 'outlined' | 'colored';
  color?: string;
  colorLight?: string;
  accessibilityLabel?: string;
}

export function Card({
  children,
  onPress,
  style,
  variant = 'default',
  color,
  colorLight,
  accessibilityLabel,
}: CardProps) {
  const c = useColors();

  const variantStyle = {
    default: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.borderLight,
    },
    elevated: {
      backgroundColor: c.surface,
      shadowColor: c.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 4,
    },
    outlined: {
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: color || c.border,
    },
    colored: {
      backgroundColor: colorLight || c.surfaceAlt,
      borderWidth: 1,
      borderColor: color || 'transparent',
    },
  };

  const content = (
    <View
      style={{
        borderRadius: 20,
        padding: 20,
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
  const c = useColors();
  const scale = useScale();

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, letterSpacing: -0.3 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: scale(14), color: c.text.secondary, marginTop: 4 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
