import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

interface WaveformVisualizerProps {
  active: boolean;
  color: string;
  barCount?: number;
  height?: number;
  reducedMotion?: boolean;
}

export function WaveformVisualizer({
  active,
  color,
  barCount = 16,
  height = 56,
  reducedMotion = false,
}: WaveformVisualizerProps) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        gap: 3,
      }}
      accessibilityLabel={active ? 'Gravando áudio' : 'Gravação pausada'}
    >
      {bars.map((i) => (
        <Bar
          key={i}
          index={i}
          color={color}
          active={active}
          maxHeight={height}
          reducedMotion={reducedMotion}
        />
      ))}
    </View>
  );
}

function Bar({
  index,
  color,
  active,
  maxHeight,
  reducedMotion,
}: {
  index: number;
  color: string;
  active: boolean;
  maxHeight: number;
  reducedMotion: boolean;
}) {
  const scaleY = useSharedValue(0.15);
  const minH = maxHeight * 0.12;
  const maxH = maxHeight * (0.4 + (Math.sin(index * 0.8) * 0.3 + 0.3));

  useEffect(() => {
    if (active && !reducedMotion) {
      const duration = 280 + Math.random() * 220;
      scaleY.value = withDelay(
        index * 40,
        withRepeat(
          withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
          -1,
          true
        )
      );
    } else {
      cancelAnimation(scaleY);
      scaleY.value = withTiming(0.15, { duration: 300 });
    }
  }, [active, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    height: minH + scaleY.value * (maxH - minH),
    opacity: active ? 0.8 + scaleY.value * 0.2 : 0.3,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          borderRadius: 3,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
