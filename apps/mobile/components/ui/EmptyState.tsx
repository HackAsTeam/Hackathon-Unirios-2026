import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '📭', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 12,
      }}
      accessibilityLabel={`${title}. ${message}`}
      accessibilityRole="alert"
    >
      <Text style={{ fontSize: 48 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text.primary,
          textAlign: 'center',
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
          maxWidth: 280,
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <View style={{ marginTop: 8 }}>
          <Button title={actionLabel} onPress={onAction} variant="primary" />
        </View>
      )}
    </View>
  );
}
