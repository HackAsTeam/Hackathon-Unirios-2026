import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../lib/colors';

interface ChipProps {
  label: string;
  color?: string;
  lightColor?: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  size?: 'sm' | 'md';
}

export function Chip({
  label,
  color = colors.primary,
  lightColor = colors.surfaceAlt,
  selected = false,
  onPress,
  icon,
  size = 'md',
}: ChipProps) {
  const isMd = size === 'md';
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: selected ? color : lightColor,
        borderRadius: 100,
        paddingVertical: isMd ? 8 : 6,
        paddingHorizontal: isMd ? 14 : 10,
        borderWidth: selected ? 0 : 1,
        borderColor: color + '30',
      }}
    >
      {icon && <Text style={{ fontSize: isMd ? 14 : 12 }}>{icon}</Text>}
      <Text
        style={{
          fontSize: isMd ? 14 : 12,
          fontWeight: '600',
          color: selected ? '#fff' : color,
        }}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }

  return content;
}
