import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResponseFormat } from '../../types/activity';
import { colors, formatIcons } from '../../lib/colors';

interface FormatIconProps {
  format: ResponseFormat;
  size?: number;
}

export function FormatIcon({ format, size = 40 }: FormatIconProps) {
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
      <Ionicons name={icon as any} size={size * 0.5} color={colors.formats[format]} />
    </View>
  );
}
