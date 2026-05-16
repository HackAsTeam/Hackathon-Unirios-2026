import { View, Text, ScrollView } from 'react-native';
import { ResponseFormat } from '../../types/activity';
import { FormatCard } from './FormatCard';
import { colors, formatIcons } from '../../lib/colors';

interface FormatSelectorProps {
  formats: ResponseFormat[];
  onSelect: (format: ResponseFormat) => void;
}

export function FormatSelector({ formats, onSelect }: FormatSelectorProps) {
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Escolha como você quer responder">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Text style={{ fontSize: 18 }}>🎯</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
          Escolha seu formato de resposta
        </Text>
      </View>
      <Text style={{ fontSize: 14, color: colors.text.secondary, marginBottom: 8, lineHeight: 20 }}>
        Você sabe o conteúdo. Agora escolha como quer mostrar isso.
        {'\n'}Cada formato tem seu superpoder!
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
      >
        {formats.map((format) => (
          <FormatCard key={format} format={format} onSelect={onSelect} compact />
        ))}
      </ScrollView>
    </View>
  );
}
