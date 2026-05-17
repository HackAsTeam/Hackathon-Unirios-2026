import { View, Text, ActivityIndicator } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Carregando...', fullScreen = true }: LoadingProps) {
  const c = useColors();
  const scale = useScale();

  const content = (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
      }}
      accessibilityLabel={message}
      accessibilityRole="alert"
    >
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={{ fontSize: scale(16), color: c.text.secondary, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );

  if (fullScreen) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        {content}
      </View>
    );
  }

  return content;
}
