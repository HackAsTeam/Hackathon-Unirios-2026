import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../lib/colors';
import { useActivityStore } from '../../../../store/activity';
import { getActivityById } from '../../../../lib/mock-data';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/layout/ScreenWrapper';
import { LearningObjective } from '../../../../components/activity/LearningObjective';
import { Button } from '../../../../components/ui/Button';
import { ProgressBar } from '../../../../components/ui/ProgressBar';

type OralState = 'idle' | 'listening' | 'transcribing' | 'done';

export default function OralResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [state, setState] = useState<OralState>('idle');
  const [transcript, setTranscript] = useState('');
  const [transcriptProgress, setTranscriptProgress] = useState(0);

  function handleStart() {
    setState('listening');
    setTimeout(() => {
      setState('transcribing');
      const interval = setInterval(() => {
        setTranscriptProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.1;
        });
      }, 300);
      setTimeout(() => {
        clearInterval(interval);
        setTranscriptProgress(1);
        setTranscript(
          'O ciclo da água começa com a evaporação da água dos rios, lagos e oceanos. O vapor sobe para a atmosfera, onde esfria e forma nuvens (condensação). Depois, a água volta para a terra em forma de chuva (precipitação) e infiltra no solo, alimentando rios e lençóis freáticos. Esse ciclo é essencial para a vida porque distribui água por todo o planeta.'
        );
        setState('done');
      }, 3000);
    }, 2000);
  }

  function handleContinue() {
    setResponseContent({ transcript, method: 'oral' });
    router.push(`/(app)/activity/submit/${id}`);
  }

  function handleRetry() {
    setState('idle');
    setTranscript('');
    setTranscriptProgress(0);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Resposta Oral" subtitle="🗣️ Fale sua resposta (com transcrição)" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <View
            style={{
              backgroundColor: colors.formatsLight.oral,
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: state === 'listening' ? colors.formats.oral : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: state === 'listening' ? colors.formats.oral + '50' : colors.formats.oral + '20',
              }}
            >
              <TouchableOpacity
                onPress={state === 'idle' ? handleStart : undefined}
                disabled={state !== 'idle'}
                accessibilityLabel="Iniciar resposta oral"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: state === 'idle' ? colors.formats.oral : state === 'listening' ? colors.error : colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24, color: '#fff' }}>
                  {state === 'idle' ? '🎤' : state === 'listening' ? '🔴' : state === 'transcribing' ? '⏳' : '✓'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, textAlign: 'center' }}>
              {state === 'idle' && 'Toque no microfone e comece a falar'}
              {state === 'listening' && 'Ouvindo... fale claramente'}
              {state === 'transcribing' && 'Transcrevendo sua resposta...'}
              {state === 'done' && 'Transcrição concluída!'}
            </Text>

            {(state === 'transcribing' || state === 'done') && (
              <View style={{ width: '100%', gap: 8 }}>
                <ProgressBar
                  progress={transcriptProgress}
                  color={colors.formats.oral}
                />
              </View>
            )}
          </View>

          {transcript.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                📝 Transcrição
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              >
                <Text style={{ fontSize: 15, color: colors.text.primary, lineHeight: 24 }}>
                  {transcript}
                </Text>
              </View>
            </View>
          )}

          <View style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.primary }}>
              💡 Como funciona
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
              Você fala sua resposta, e nós transcrevemos automaticamente. 
              Perfeito para quem prefere explicar falando ao invés de escrever!
              {'\n'}Acessível para usuários de leitores de tela.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {state === 'done' && (
              <>
                <Button title="Continuar" onPress={handleContinue} variant="primary" size="lg" fullWidth icon="→" />
                <Button title="Gravar novamente" onPress={handleRetry} variant="ghost" fullWidth />
              </>
            )}
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}
