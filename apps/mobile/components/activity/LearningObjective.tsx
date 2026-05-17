import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';

interface LearningObjectiveProps {
  objective: string;
  compact?: boolean;
}

export function LearningObjective({ objective, compact = false }: LearningObjectiveProps) {
  const c = useColors();
  const scale = useScale();

  return (
    <View
      style={{
        backgroundColor: c.primary + '0D',
        borderRadius: 16,
        padding: compact ? 14 : 20,
        borderLeftWidth: 4,
        borderLeftColor: c.primary,
      }}
      accessibilityLabel={`Objetivo de aprendizagem: ${objective}`}
      accessibilityRole="text"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: compact ? 4 : 8 }}>
        <Ionicons name="flag-outline" size={compact ? 14 : 16} color={c.primary} />
        <Text
          style={{
            fontSize: scale(compact ? 12 : 13),
            fontWeight: '700',
            color: c.primary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Objetivo de Aprendizagem
        </Text>
      </View>
      <Text
        style={{
          fontSize: scale(compact ? 14 : 17),
          fontWeight: '600',
          color: c.text.primary,
          lineHeight: compact ? 20 : 26,
          letterSpacing: -0.2,
        }}
      >
        {objective}
      </Text>
    </View>
  );
}
