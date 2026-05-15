import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../lib/colors';
import { useActivityStore } from '../../../../store/activity';
import { getActivityById } from '../../../../lib/mock-data';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/layout/ScreenWrapper';
import { LearningObjective } from '../../../../components/activity/LearningObjective';
import { FormatCard } from '../../../../components/format/FormatCard';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { ProgressBar } from '../../../../components/ui/ProgressBar';
import { ResponseFormat } from '../../../../types/activity';

export default function RespondFormatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setCurrentFormat } = useActivityStore();
  const activity = getActivityById(id || '');

  if (!activity) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Responder" showBack />
        <EmptyState
          icon="🔍"
          title="Atividade não encontrada"
          message="Não foi possível carregar esta atividade."
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const formatRoutes: Record<ResponseFormat, string> = {
    text: `/(app)/activity/respond/text?id=${id}`,
    audio: `/(app)/activity/respond/audio?id=${id}`,
    video: `/(app)/activity/respond/video?id=${id}`,
    drawing: `/(app)/activity/respond/drawing?id=${id}`,
    mindmap: `/(app)/activity/respond/drawing?id=${id}`,
    presentation: `/(app)/activity/respond/presentation?id=${id}`,
    quiz: `/(app)/activity/respond/quiz?id=${id}`,
    podcast: `/(app)/activity/respond/podcast?id=${id}`,
    oral: `/(app)/activity/respond/oral?id=${id}`,
  };

  function handleSelectFormat(format: ResponseFormat) {
    setCurrentFormat(format);
    (router.push as (s: string) => void)(formatRoutes[format]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Responder" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 100 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {activity.subject}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.5 }}>
              {activity.title}
            </Text>
          </View>

          <LearningObjective objective={activity.learningObjective} />

          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 22 }}>🎨</Text>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
                  Como você quer responder?
                </Text>
                <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
                  Escolha o formato que mais combina com seu jeito de aprender
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {activity.allowedFormats.map((format) => (
              <FormatCard
                key={format}
                format={format}
                onSelect={handleSelectFormat}
              />
            ))}
          </View>

          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 16,
              padding: 16,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              💡 Não sabe qual escolher?
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
              Pense em como você explica melhor o que aprendeu. Se gosta de desenhar, escolha Desenho. Se prefere falar, escolha Áudio ou Resposta Oral. O importante é mostrar o que você sabe!
            </Text>
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}
