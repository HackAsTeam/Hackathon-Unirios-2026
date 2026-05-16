import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Algo deu errado. Tente novamente.', onRetry }: ErrorStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 12,
        backgroundColor: colors.background,
      }}
      accessibilityLabel={`Erro: ${message}`}
      accessibilityRole="alert"
    >
      <Text style={{ fontSize: 48 }}>😕</Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary,
          textAlign: 'center',
        }}
      >
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: colors.text.secondary,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
      {onRetry && (
        <View style={{ marginTop: 8 }}>
          <Button title="Tentar novamente" onPress={onRetry} variant="primary" />
        </View>
      )}
    </View>
  );
}
