import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAttemptDetail } from '../../../hooks/useAttemptDetail';
import { AttemptStatusBadge } from '../../../components/student/AttemptStatusBadge';
import { useColors } from '../../../hooks/useColors';
import { useScale } from '../../../hooks/useScale';
import type { AnswerDetail } from '../../../types/attempt';

export default function AttemptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const scale = useScale();
  const { data: attempt, isLoading, isError } = useAttemptDetail(id ?? '');

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (isError || !attempt) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Ionicons name="alert-circle-outline" size={56} color={c.error} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, textAlign: 'center', marginBottom: 24 }}>
          Não foi possível carregar os detalhes
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: c.primary, fontWeight: '600', fontSize: scale(16) }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGraded = attempt.status === 'Graded';
  const isSubmitted = attempt.status === 'Submitted';
  const isInProgress = attempt.status === 'InProgress';

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={c.primary} />
          <Text style={{ fontSize: scale(15), color: c.primary, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <View style={{
          backgroundColor: c.surfaceAlt,
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: c.primaryLight + '30',
          gap: 10,
        }}>
          <Text style={{ fontSize: scale(13), fontWeight: '600', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Resultado
          </Text>
          <Text style={{ fontSize: scale(22), fontWeight: '800', color: c.text.primary, letterSpacing: -0.5 }}>
            {attempt.examTitle ?? 'Atividade'}
          </Text>
          <Text style={{ fontSize: scale(14), color: c.text.secondary }}>
            {attempt.classroomName ?? ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <AttemptStatusBadge status={attempt.status} score={attempt.score ?? undefined} />
            {isGraded && attempt.score !== null && (
              <Text style={{ fontSize: scale(14), fontWeight: '700', color: c.primary }}>
                Nota: {attempt.score} / 10
              </Text>
            )}
          </View>
        </View>

        {attempt.answers.length === 0 && (
          <Text style={{ fontSize: scale(15), color: c.text.secondary, textAlign: 'center', padding: 24 }}>
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
          backgroundColor: c.background,
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Continuar respondendo"
            accessibilityRole="button"
            style={{
              backgroundColor: c.primary,
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
}: {
  answer: AnswerDetail;
  index: number;
  isGraded: boolean;
  isSubmitted: boolean;
}) {
  const c = useColors();
  const scale = useScale();

  return (
    <View style={{
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: c.borderLight,
      gap: 10,
    }}>
      <Text style={{ fontSize: scale(13), color: c.primary, fontWeight: '600' }}>
        Questão {index + 1}
      </Text>
      <Text style={{ fontSize: scale(15), color: c.text.primary, lineHeight: scale(22) }}>
        {answer.questionText}
      </Text>

      <View style={{
        borderTopWidth: 1,
        borderTopColor: c.borderLight,
        paddingTop: 10,
        gap: 4,
      }}>
        <Text style={{ fontSize: scale(12), fontWeight: '600', color: c.text.secondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Sua resposta
        </Text>
        <Text style={{ fontSize: scale(14), color: c.text.primary, lineHeight: scale(20) }}>
          {answer.answerText ?? '(sem resposta em texto)'}
        </Text>
      </View>

      {isGraded && (
        <View style={{
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
          paddingTop: 10,
          gap: 4,
        }}>
          <Text style={{ fontSize: scale(13), fontWeight: '700', color: c.primary }}>
            {answer.score !== null ? `✓ ${answer.score} pt` : '—'}
          </Text>
          {answer.feedback && (
            <Text style={{ fontSize: scale(13), color: c.text.secondary, lineHeight: scale(19) }}>
              {answer.feedback}
            </Text>
          )}
        </View>
      )}

      {isSubmitted && (
        <View style={{
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
          paddingTop: 8,
        }}>
          <Text style={{ fontSize: scale(13), color: c.text.tertiary, fontStyle: 'italic' }}>
            Aguardando avaliação do professor
          </Text>
        </View>
      )}
    </View>
  );
}
