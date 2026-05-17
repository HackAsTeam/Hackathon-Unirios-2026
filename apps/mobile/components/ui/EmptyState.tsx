import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';
import { Button } from './Button';

interface EmptyStateProps {
  iconName?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ iconName = 'mail-open-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const c = useColors();
  const scale = useScale();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 12,
        backgroundColor: c.background,
      }}
      accessibilityLabel={`${title}. ${message}`}
      accessibilityRole="alert"
    >
      <Ionicons name={iconName as any} size={56} color={c.text.tertiary} />
      <Text
        style={{
          fontSize: scale(20),
          fontWeight: '700',
          color: c.text.primary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: scale(15),
          color: c.text.secondary,
          textAlign: 'center',
          lineHeight: scale(15) * 1.5,
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
