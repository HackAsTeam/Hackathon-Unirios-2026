import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Algo deu errado. Tente novamente.', onRetry }: ErrorStateProps) {
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
      accessibilityLabel={`Erro: ${message}`}
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle-outline" size={56} color={c.error} />
      <Text
        style={{
          fontSize: scale(15),
          color: c.text.secondary,
          textAlign: 'center',
          lineHeight: scale(15) * 1.5,
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
