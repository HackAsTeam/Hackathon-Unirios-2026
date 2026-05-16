import { View, Text } from 'react-native';
import { ResponseFormat } from '../../types/activity';
import { colors, formatIcons } from '../../lib/colors';

interface FormatIconProps {
  format: ResponseFormat;
  size?: number;
}

export function FormatIcon({ format, size = 40 }: FormatIconProps) {
  const color = colors.formats[format];
  const lightColor = colors.formatsLight[format];
  const icon = formatIcons[format];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: lightColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel={`Formato: ${format}`}
    >
      <Text style={{ fontSize: size * 0.5 }}>{icon}</Text>
    </View>
  );
}
