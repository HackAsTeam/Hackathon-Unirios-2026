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

type AudioState = 'idle' | 'recording' | 'recorded' | 'playing';

export default function AudioResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [duration, setDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  function handleStartRecording() {
    setAudioState('recording');
    setDuration(0);
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    setRecordingTimer(timer);
  }

  function handleStopRecording() {
    if (recordingTimer) clearInterval(recordingTimer);
    setRecordingTimer(null);
    setAudioState('recorded');
  }

  function handlePlayAudio() {
    setAudioState('playing');
    setTimeout(() => setAudioState('recorded'), 2000);
  }

  function handleContinue() {
    setResponseContent({ duration, state: 'recorded' });
    router.push(`/(app)/activity/submit/${id}`);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Resposta em Áudio" subtitle="🎤 Grave sua explicação" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <View
            style={{
              backgroundColor: colors.formatsLight.audio,
              borderRadius: 20,
              padding: 32,
              alignItems: 'center',
              gap: 20,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: audioState === 'recording' ? colors.formats.audio : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: audioState === 'recording' ? colors.formats.audio + '40' : colors.formats.audio + '20',
              }}
            >
              <TouchableOpacity
                onPress={audioState === 'recording' ? handleStopRecording : audioState === 'recorded' ? handlePlayAudio : handleStartRecording}
                accessibilityLabel={audioState === 'idle' ? 'Iniciar gravação' : audioState === 'recording' ? 'Parar gravação' : 'Ouvir gravação'}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: audioState === 'recording' ? colors.error : colors.formats.audio,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 28, color: '#fff' }}>
                  {audioState === 'recording' ? '■' : audioState === 'recorded' || audioState === 'playing' ? '▶' : '🎤'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.text.primary, fontVariant: ['tabular-nums'] }}>
                {formatTime(duration)}
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                {audioState === 'idle' && 'Toque para começar a gravar'}
                {audioState === 'recording' && 'Gravando... toque para parar'}
                {audioState === 'recorded' && 'Gravação concluída! Toque para ouvir'}
                {audioState === 'playing' && 'Reproduzindo...'}
              </Text>
            </View>

            {audioState === 'recording' && (
              <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.error,
                  }}
                />
                <Text style={{ fontSize: 13, color: colors.error, fontWeight: '600' }}>
                  GRAVANDO
                </Text>
              </View>
            )}
          </View>

          <View style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              💡 Dicas para sua gravação
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
              • Fale em um lugar calmo{'\n'}
              • Explique como se estivesse ensinando alguém{'\n'}
              • Não precisa ser perfeito, o importante é mostrar o que você sabe
            </Text>
          </View>

          <Button
            title={audioState === 'idle' ? 'Gravar' : audioState === 'recording' ? 'Parar gravação' : 'Continuar'}
            onPress={audioState === 'idle' ? handleStartRecording : audioState === 'recording' ? handleStopRecording : handleContinue}
            variant={audioState === 'recording' ? 'danger' : 'primary'}
            size="lg"
            fullWidth
            disabled={false}
          />
        </View>
      </ScreenWrapper>
    </View>
  );
}
