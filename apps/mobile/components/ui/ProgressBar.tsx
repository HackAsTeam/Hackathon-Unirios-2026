import { View } from 'react-native';
import { colors } from '../../lib/colors';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 6,
  backgroundColor = colors.borderLight,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={{
        width: '100%',
        height,
        backgroundColor,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress * 100) }}
    >
      <View
        style={{
          width: `${clampedProgress * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
