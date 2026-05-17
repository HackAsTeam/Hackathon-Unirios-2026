import { View } from 'react-native';
import { useColors } from '../../hooks/useColors';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  color,
  height = 6,
  backgroundColor,
}: ProgressBarProps) {
  const c = useColors();
  const finalColor = color ?? c.primary;
  const finalBg = backgroundColor ?? c.borderLight;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={{
        width: '100%',
        height,
        backgroundColor: finalBg,
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
          backgroundColor: finalColor,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
