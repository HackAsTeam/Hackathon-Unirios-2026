import { TouchableOpacity, View, Text } from 'react-native';
import { ResponseFormat } from '../../types/activity';
import { colors, formatLabels, formatDescriptions, formatMotivations } from '../../lib/colors';
import { FormatIcon } from './FormatIcon';

interface FormatCardProps {
  format: ResponseFormat;
  onSelect: (format: ResponseFormat) => void;
  compact?: boolean;
}

export function FormatCard({ format, onSelect, compact = false }: FormatCardProps) {
  const color = colors.formats[format];
  const lightColor = colors.formatsLight[format];

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onSelect(format)}
        activeOpacity={0.7}
        accessibilityLabel={`Responder em ${formatLabels[format]}: ${formatDescriptions[format]}`}
        accessibilityRole="button"
        style={{
          backgroundColor: lightColor,
          borderRadius: 16,
          padding: 14,
          alignItems: 'center',
          gap: 8,
          width: 90,
          borderWidth: 1.5,
          borderColor: color + '25',
        }}
      >
        <FormatIcon format={format} size={36} />
        <Text style={{ fontSize: 12, fontWeight: '600', color, textAlign: 'center', lineHeight: 16 }}>
          {formatLabels[format]}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onSelect(format)}
      activeOpacity={0.8}
      accessibilityLabel={`${formatLabels[format]}: ${formatDescriptions[format]}`}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1.5,
        borderColor: color + '20',
        shadowColor: color + '30',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <FormatIcon format={format} size={48} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
            {formatLabels[format]}
          </Text>
          <Text style={{ fontSize: 14, color: color, fontWeight: '500' }}>
            {formatMotivations[format]}
          </Text>
          <Text style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 2 }}>
            {formatDescriptions[format]}
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: color }}>→</Text>
      </View>
    </TouchableOpacity>
  );
}
