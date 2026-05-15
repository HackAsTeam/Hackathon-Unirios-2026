import { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function AppInput({ label, error, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-red-400'
    : focused
      ? 'border-green-500'
      : 'border-green-200';

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-green-900 mb-1">{label}</Text>
      <TextInput
        className={`border ${borderClass} rounded-xl px-4 py-3 text-base text-green-900 bg-white min-h-[44px]`}
        placeholderTextColor="#9ca3af"
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <Text className="text-red-600 text-xs mt-1" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
