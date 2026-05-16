import { View, ScrollView, RefreshControl } from 'react-native';
import { colors } from '../../lib/colors';
import { useAccessibilityStore } from '../../store/accessibility';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  paddingHorizontal?: number;
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  scroll = false,
  refreshing = false,
  onRefresh,
  paddingHorizontal = 24,
  backgroundColor = colors.background,
}: ScreenWrapperProps) {
  const { highContrast } = useAccessibilityStore();

  const bg = highContrast ? '#000000' : backgroundColor;

  if (scroll) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{
          paddingHorizontal,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingHorizontal }}>
      {children}
    </View>
  );
}
