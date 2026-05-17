import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAttemptDetail } from '../../../hooks/useAttemptDetail';
import { AttemptStatusBadge } from '../../../components/student/AttemptStatusBadge';
import { useAccessibilityStore } from '../../../store/acessibility';
import { colors } from '../../../lib/colors';
import type { AnswerDetail } from '../../../types/attempt';

export default function AttemptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fontSizeScale, highContrast } = useAccessibilityStore();
  const { data: attempt, isLoading, isError } = useAttemptDetail(id ?? '');

  const bg = highContrast ? '#000' : colors.background;
  const textPrimary = highContrast ? '#fff' : colors.text.primary;
  const textSecondary = highContrast ? '#aaa' : colors.text.secondary;
  const surfaceColor = highContrast ? '#111' : colors.surface;
  const surfaceAlt = highContrast ? '#1a1a1a' : colors.surfaceAlt;

  function scale(base: number) {
    return Math.round(base * fontSizeScale);
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !attempt) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: scale(40), marginBottom: 16 }}>😕</Text>
        <Text style={{ fontSize: scale(18), fontWeight: '700', color: textPrimary, textAlign: 'center', marginBottom: 24 }}>
          Não foi possível carregar os detalhes
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: scale(16) }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGraded = attempt.status === 'Graded';
  const isSubmitted = attempt.status === 'Submitted';
  const isInProgress = attempt.status === 'InProgress';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={{ fontSize: scale(15), color: colors.primary, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <View style={{
          backgroundColor: surfaceAlt,
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.primaryLight + '30',
          gap: 10,
        }}>
          <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Resultado
          </Text>
          <Text style={{ fontSize: scale(22), fontWeight: '800', color: textPrimary, letterSpacing: -0.5 }}>
            {attempt.examTitle ?? 'Atividade'}
          </Text>
          <Text style={{ fontSize: scale(14), color: textSecondary }}>
            {attempt.classroomName ?? ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <AttemptStatusBadge status={attempt.status} score={attempt.score ?? undefined} />
            {isGraded && attempt.score !== null && (
              <Text style={{ fontSize: scale(14), fontWeight: '700', color: colors.primary }}>
                Nota: {attempt.score} / 10
              </Text>
            )}
          </View>
        </View>

        {attempt.answers.length === 0 && (
          <Text style={{ fontSize: scale(15), color: textSecondary, textAlign: 'center', padding: 24 }}>
            Nenhuma resposta registrada.
          </Text>
        )}

        <View style={{ gap: 16 }}>
          {attempt.answers.map((answer, i) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              index={i}
              isGraded={isGraded}
              isSubmitted={isSubmitted}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              surfaceColor={surfaceColor}
              fontScale={fontSizeScale}
              highContrast={highContrast}
            />
          ))}
        </View>
      </ScrollView>

      {isInProgress && (
        <View style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: 20,
          paddingBottom: Platform.OS === 'ios' ? 36 : 20,
          backgroundColor: bg,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Continuar respondendo"
            accessibilityRole="button"
            style={{
              backgroundColor: colors.primary,
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: scale(17), fontWeight: '700', color: '#fff' }}>
              Continuar respondendo
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function AnswerCard({
  answer,
  index,
  isGraded,
  isSubmitted,
  textPrimary,
  textSecondary,
  surfaceColor,
  fontScale,
  highContrast,
}: {
  answer: AnswerDetail;
  index: number;
  isGraded: boolean;
  isSubmitted: boolean;
  textPrimary: string;
  textSecondary: string;
  surfaceColor: string;
  fontScale: number;
  highContrast: boolean;
}) {
  function scale(base: number) {
    return Math.round(base * fontScale);
  }

  const borderColor = highContrast ? '#333' : colors.borderLight;

  return (
    <View style={{
      backgroundColor: surfaceColor,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor,
      gap: 10,
    }}>
      <Text style={{ fontSize: scale(13), color: colors.primary, fontWeight: '600' }}>
        Questão {index + 1}
      </Text>
      <Text style={{ fontSize: scale(15), color: textPrimary, lineHeight: scale(22) }}>
        {answer.questionText}
      </Text>

      <View style={{
        borderTopWidth: 1,
        borderTopColor: borderColor,
        paddingTop: 10,
        gap: 4,
      }}>
        <Text style={{ fontSize: scale(12), fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Sua resposta
        </Text>
        <Text style={{ fontSize: scale(14), color: textPrimary, lineHeight: scale(20) }}>
          {answer.answerText ?? '(sem resposta em texto)'}
        </Text>
      </View>

      {isGraded && (
        <View style={{
          borderTopWidth: 1,
          borderTopColor: borderColor,
          paddingTop: 10,
          gap: 4,
        }}>
          <Text style={{ fontSize: scale(13), fontWeight: '700', color: colors.primary }}>
            {answer.score !== null ? `✓ ${answer.score} pt` : '—'}
          </Text>
          {answer.feedback && (
            <Text style={{ fontSize: scale(13), color: textSecondary, lineHeight: scale(19) }}>
              {answer.feedback}
            </Text>
          )}
        </View>
      )}

      {isSubmitted && (
        <View style={{
          borderTopWidth: 1,
          borderTopColor: borderColor,
          paddingTop: 8,
        }}>
          <Text style={{ fontSize: scale(13), color: colors.text.tertiary, fontStyle: 'italic' }}>
            Aguardando avaliação do professor
          </Text>
        </View>
      )}
    </View>
  );
}
