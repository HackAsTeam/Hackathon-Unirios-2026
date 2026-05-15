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

type VideoState = 'idle' | 'recording' | 'recorded';

export default function VideoResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [videoState, setVideoState] = useState<VideoState>('idle');

  function handleRecord() {
    setVideoState('recording');
    setTimeout(() => setVideoState('recorded'), 3000);
  }

  function handleContinue() {
    setResponseContent({ state: 'recorded', duration: 30 });
    router.push(`/(app)/activity/submit/${id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Resposta em Vídeo" subtitle="🎬 Grave seu vídeo" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <View
            style={{
              backgroundColor: '#000',
              borderRadius: 20,
              height: 320,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {videoState === 'idle' && (
              <TouchableOpacity
                onPress={handleRecord}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.formats.video,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityLabel="Iniciar gravação de vídeo"
              >
                <Text style={{ fontSize: 32, color: '#fff' }}>🎬</Text>
              </TouchableOpacity>
            )}
            {videoState === 'recording' && (
              <View style={{ alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: colors.error,
                  }}
                />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Gravando...</Text>
              </View>
            )}
            {videoState === 'recorded' && (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 48 }}>✅</Text>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Vídeo gravado!</Text>
                <TouchableOpacity onPress={handleRecord} style={{ padding: 8 }}>
                  <Text style={{ color: colors.formats.video, fontSize: 14 }}>Gravar novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{
            backgroundColor: colors.formatsLight.video,
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.formats.video }}>
              Dicas para seu vídeo
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
              • Escolha um local bem iluminado{'\n'}
              • Fale de forma clara e pausada{'\n'}
                  • Mostre exemplos visuais se possível{'\n'}
              • Vídeos de 1-3 minutos são ideais
            </Text>
          </View>

          <Button
            title={videoState === 'recorded' ? 'Continuar' : 'Gravar vídeo'}
            onPress={videoState === 'recorded' ? handleContinue : handleRecord}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </ScreenWrapper>
    </View>
  );
}
