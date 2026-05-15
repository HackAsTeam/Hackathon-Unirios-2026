import { Pressable, Text, ActivityIndicator, Animated } from 'react-native';
import { useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Variant = 'primary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  accessibilityHint?: string;
};

const variantClass: Record<Variant, string> = {
  primary: 'bg-green-600',
  danger: 'bg-red-600',
};

export function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  accessibilityHint,
}: Props) {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const isDisabled = disabled || loading;

  function handlePressIn() {
    if (reduceMotion) return;
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 200, friction: 10 }).start();
  }

  function handlePressOut() {
    if (reduceMotion) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        className={`${variantClass[variant]} rounded-xl py-4 items-center justify-center min-h-[44px] ${isDisabled ? 'opacity-60' : ''}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="text-white font-semibold text-base">{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
