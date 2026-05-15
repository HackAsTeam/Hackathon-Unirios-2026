import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../lib/colors';
import { useActivityStore } from '../../../../store/activity';
import { getActivityById } from '../../../../lib/mock-data';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/layout/ScreenWrapper';
import { LearningObjective } from '../../../../components/activity/LearningObjective';
import { Button } from '../../../../components/ui/Button';

type PodcastState = 'planning' | 'recording' | 'recorded';

export default function PodcastResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [state, setState] = useState<PodcastState>('planning');
  const [script, setScript] = useState('');

  function handleStartRecording() {
    setState('recording');
    setTimeout(() => setState('recorded'), 2000);
  }

  function handleContinue() {
    setResponseContent({ script, state: 'recorded' });
    router.push(`/(app)/activity/submit/${id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Podcast" subtitle="🎙️ Grave seu podcast" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <View
            style={{
              backgroundColor: colors.formatsLight.podcast,
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: state === 'recording' ? colors.formats.podcast : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                onPress={state === 'planning' ? handleStartRecording : undefined}
                disabled={state !== 'planning'}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: state === 'planning' ? colors.formats.podcast : colors.text.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24, color: '#fff' }}>
                  {state === 'planning' ? '🎙️' : state === 'recording' ? '🔴' : '✓'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
              {state === 'planning' && 'Prepare seu roteiro e grave'}
              {state === 'recording' && 'Gravando podcast...'}
              {state === 'recorded' && 'Podcast gravado!'}
            </Text>
          </View>

          {state === 'planning' && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                📝 Roteiro do podcast
              </Text>
              <TextInput
                value={script}
                onChangeText={setScript}
                placeholder="Escreva um roteiro curto para seu podcast..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                textAlignVertical="top"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 15,
                  color: colors.text.primary,
                  lineHeight: 22,
                  minHeight: 120,
                  borderWidth: 1.5,
                  borderColor: colors.formats.podcast + '25',
                }}
              />
            </View>
          )}

          <View style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.formats.podcast }}>
              Dicas para seu podcast
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
              • Fale como se estivesse conversando com um amigo{'\n'}
              • Use uma introdução, desenvolvimento e conclusão{'\n'}
              • Seja natural, não precisa ler perfeitamente
            </Text>
          </View>

          <Button
            title={state === 'planning' ? 'Gravar podcast' : state === 'recorded' ? 'Continuar' : 'Aguarde...'}
            onPress={state === 'planning' ? handleStartRecording : state === 'recorded' ? handleContinue : () => {}}
            variant="primary"
            size="lg"
            fullWidth
            disabled={state === 'recording'}
          />
        </View>
      </ScreenWrapper>
    </View>
  );
}
