import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';

interface LearningObjectiveProps {
  objective: string;
  compact?: boolean;
}

export function LearningObjective({ objective, compact = false }: LearningObjectiveProps) {
  return (
    <View
      style={{
        backgroundColor: colors.primary + '0D',
        borderRadius: 16,
        padding: compact ? 14 : 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
      }}
      accessibilityLabel={`Objetivo de aprendizagem: ${objective}`}
      accessibilityRole="text"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: compact ? 4 : 8 }}>
        <Text style={{ fontSize: compact ? 14 : 16 }}>🎯</Text>
        <Text
          style={{
            fontSize: compact ? 12 : 13,
            fontWeight: '700',
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Objetivo de Aprendizagem
        </Text>
      </View>
      <Text
        style={{
          fontSize: compact ? 14 : 17,
          fontWeight: '600',
          color: colors.text.primary,
          lineHeight: compact ? 20 : 26,
          letterSpacing: -0.2,
        }}
      >
        {objective}
      </Text>
    </View>
  );
}
