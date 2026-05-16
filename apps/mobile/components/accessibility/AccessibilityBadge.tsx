import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';

interface AccessibilityBadgeProps {
  features: string[];
}

export function AccessibilityBadge({ features }: AccessibilityBadgeProps) {
  if (features.length === 0) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
      }}
      accessibilityLabel="Recursos de acessibilidade disponíveis"
    >
      {features.map((feature) => (
        <View
          key={feature}
          style={{
            backgroundColor: colors.infoLight,
            borderRadius: 100,
            paddingHorizontal: 10,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 11, color: colors.info, fontWeight: '600' }}>
            {feature === 'audio' ? '🔊' : feature === 'transcript' ? '📝' : feature === 'tts' ? '🗣️' : feature === 'highContrast' ? '👁️' : '♿'} {feature === 'audio' ? 'Áudio' : feature === 'transcript' ? 'Transcrição' : feature === 'tts' ? 'Texto em Voz' : feature === 'highContrast' ? 'Alto Contraste' : feature === 'text' ? 'Texto Alternativo' : 'Acessível'}
          </Text>
        </View>
      ))}
    </View>
  );
}
