import { SafeAreaView, ScrollView, View } from 'react-native';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
};

export function AppScreen({ children, scroll = false }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-green-50">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </SafeAreaView>
  );
}
