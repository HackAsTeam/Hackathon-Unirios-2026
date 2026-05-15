import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';
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
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 16,
        backgroundColor: colors.background,
      }}
      accessibilityLabel={`${title}. ${message}`}
      accessibilityRole="alert"
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.successLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 36 }}>✓</Text>
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: colors.text.primary,
          textAlign: 'center',
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: colors.text.secondary,
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
