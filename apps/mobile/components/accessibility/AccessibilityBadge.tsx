import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';

interface AccessibilityBadgeProps {
  features: string[];
}

export function AccessibilityBadge({ features }: AccessibilityBadgeProps) {
  const c = useColors();
  const scale = useScale();

  if (features.length === 0) return null;

  function iconFor(feature: string): string {
    switch (feature) {
      case 'audio': return 'volume-high-outline';
      case 'transcript': return 'document-text-outline';
      case 'tts': return 'chatbubble-ellipses-outline';
      case 'highContrast': return 'eye-outline';
      default: return 'accessibility-outline';
    }
  }

  function labelFor(feature: string): string {
    switch (feature) {
      case 'audio': return 'Áudio';
      case 'transcript': return 'Transcrição';
      case 'tts': return 'Texto em Voz';
      case 'highContrast': return 'Alto Contraste';
      case 'text': return 'Texto Alternativo';
      default: return 'Acessível';
    }
  }

  return (
    <View
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}
      accessibilityLabel="Recursos de acessibilidade disponíveis"
    >
      {features.map((feature) => (
        <View
          key={feature}
          style={{
            backgroundColor: c.infoLight,
            borderRadius: 100,
            paddingHorizontal: 10,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Ionicons name={iconFor(feature) as any} size={scale(11)} color={c.info} />
          <Text style={{ fontSize: scale(11), color: c.info, fontWeight: '600' }}>
            {labelFor(feature)}
          </Text>
        </View>
      ))}
    </View>
  );
}
