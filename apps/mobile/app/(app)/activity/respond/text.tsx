import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../lib/colors';
import { useActivityStore } from '../../../../store/activity';
import { getActivityById } from '../../../../lib/mock-data';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/layout/ScreenWrapper';
import { LearningObjective } from '../../../../components/activity/LearningObjective';
import { Button } from '../../../../components/ui/Button';

export default function TextResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  function handleTextChange(value: string) {
    setText(value);
    setWordCount(value.trim().split(/\s+/).filter(Boolean).length);
  }

  function handleContinue() {
    setResponseContent({ text, wordCount });
    router.push(`/(app)/activity/submit/${id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Resposta em Texto" subtitle="✍️ Escreva sua resposta" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <View
            style={{
              backgroundColor: colors.formatsLight.text,
              borderRadius: 16,
              padding: 16,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.formats.text }}>
              Dicas para sua resposta
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
              • Organize suas ideias antes de escrever{'\n'}
              • Use exemplos para mostrar o que aprendeu{'\n'}
              • Não se preocupe com o tamanho, foque no conteúdo
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                Sua resposta
              </Text>
              <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}
              </Text>
            </View>
            <TextInput
              value={text}
              onChangeText={handleTextChange}
              placeholder="Escreva aqui o que você aprendeu..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              textAlignVertical="top"
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                fontSize: 16,
                color: colors.text.primary,
                lineHeight: 24,
                minHeight: 240,
                borderWidth: 1.5,
                borderColor: colors.formats.text + '25',
              }}
              accessibilityLabel="Campo de texto para sua resposta"
              accessibilityHint="Escreva sua resposta sobre a atividade"
            />
          </View>

          <Button
            title="Continuar"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            disabled={text.trim().length === 0}
            icon="→"
          />
        </View>
      </ScreenWrapper>
    </View>
  );
}
