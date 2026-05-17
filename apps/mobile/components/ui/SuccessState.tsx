import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';
import { Button } from './Button';

interface SuccessStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function SuccessState({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: SuccessStateProps) {
  const c = useColors();
  const scale = useScale();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 16,
        backgroundColor: c.background,
      }}
      accessibilityLabel={`${title}. ${message}`}
      accessibilityRole="alert"
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: c.successLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="checkmark-circle" size={44} color={c.success} />
      </View>
      <Text
        style={{
          fontSize: scale(22),
          fontWeight: '700',
          color: c.text.primary,
          textAlign: 'center',
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: scale(15),
          color: c.text.secondary,
          textAlign: 'center',
          lineHeight: 22,
          maxWidth: 300,
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" size="lg" />
      )}
      {secondaryLabel && onSecondary && (
        <Button title={secondaryLabel} onPress={onSecondary} variant="ghost" />
      )}
    </View>
  );
}
