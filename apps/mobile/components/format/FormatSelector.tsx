import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResponseFormat } from '../../types/activity';
import { FormatCard } from './FormatCard';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';

interface FormatSelectorProps {
  formats: ResponseFormat[];
  onSelect: (format: ResponseFormat) => void;
}

export function FormatSelector({ formats, onSelect }: FormatSelectorProps) {
  const c = useColors();
  const scale = useScale();

  return (
    <View style={{ gap: 12 }} accessibilityLabel="Escolha como você quer responder">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Ionicons name="apps-outline" size={scale(18)} color={c.primary} />
        <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary }}>
          Escolha seu formato de resposta
        </Text>
      </View>
      <Text style={{ fontSize: scale(14), color: c.text.secondary, marginBottom: 8, lineHeight: 20 }}>
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
