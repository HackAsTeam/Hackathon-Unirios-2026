import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../lib/colors';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Carregando...', fullScreen = true }: LoadingProps) {
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
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ fontSize: 16, color: colors.text.secondary, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );

  if (fullScreen) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        {content}
      </View>
    );
  }

  return content;
}
