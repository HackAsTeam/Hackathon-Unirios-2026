import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../lib/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.primary, text: colors.text.inverse, border: colors.primary },
  secondary: { bg: colors.surfaceAlt, text: colors.primary, border: 'transparent' },
  outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
  ghost: { bg: 'transparent', text: colors.primary, border: 'transparent' },
  danger: { bg: colors.error, text: colors.text.inverse, border: colors.error },
};

const sizeStyles: Record<string, { py: number; px: number; fs: number }> = {
  sm: { py: 10, px: 16, fs: 14 },
  md: { py: 14, px: 24, fs: 16 },
  lg: { py: 18, px: 32, fs: 18 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={0.8}
      style={{
        backgroundColor: vs.bg,
        borderColor: vs.border,
        borderWidth: variant === 'outline' ? 1.5 : 0,
        borderRadius: 16,
        paddingVertical: ss.py,
        paddingHorizontal: ss.px,
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...(fullWidth ? { width: '100%' as const } : {}),
      }}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {icon && <Text style={{ fontSize: ss.fs }}>{icon}</Text>}
          <Text
            style={{
              color: vs.text,
              fontSize: ss.fs,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
