import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

interface ChipProps {
  label: string;
  color?: string;
  lightColor?: string;
  selected?: boolean;
  onPress?: () => void;
  iconName?: string;
  size?: 'sm' | 'md';
}

export function Chip({
  label,
  color,
  lightColor,
  selected = false,
  onPress,
  iconName,
  size = 'md',
}: ChipProps) {
  const c = useColors();
  const effectiveColor = color ?? c.primary;
  const effectiveLightColor = lightColor ?? c.surfaceAlt;
  const isMd = size === 'md';
  const iconSize = isMd ? 14 : 12;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: selected ? effectiveColor : effectiveLightColor,
        borderRadius: 100,
        paddingVertical: isMd ? 8 : 6,
        paddingHorizontal: isMd ? 14 : 10,
        borderWidth: selected ? 0 : 1,
        borderColor: effectiveColor + '30',
      }}
    >
      {iconName && <Ionicons name={iconName as any} size={iconSize} color={selected ? '#fff' : effectiveColor} />}
      <Text
        style={{
          fontSize: isMd ? 14 : 12,
          fontWeight: '600',
          color: selected ? '#fff' : effectiveColor,
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
