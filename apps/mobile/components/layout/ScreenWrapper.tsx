import { View, ScrollView, RefreshControl } from 'react-native';
import { useColors } from '../../hooks/useColors';

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
  backgroundColor,
}: ScreenWrapperProps) {
  const c = useColors();
  const bg = backgroundColor ?? c.background;

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
              tintColor={c.primary}
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
