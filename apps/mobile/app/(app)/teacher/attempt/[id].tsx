import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { useScreenContext } from '@/hooks/useScreenContext';
import { useVoiceCommandStore } from '@/store/voiceCommand';
import { apiFetch } from '@/lib/api';
import { colors } from '@/lib/colors';
import { AttemptStatusBadge } from '@/components/student/AttemptStatusBadge';
import type { AttemptDetail } from '@/types/attempt';

export default function TeacherAttemptDetailScreen() {
  const { id, studentName } = useLocalSearchParams<{ id: string; studentName: string }>();
  useScreenContext({ screen: 'teacher-grade-attempt', attemptId: id, role: 'teacher' });
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);
  const queryClient = useQueryClient();

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['attempt-teacher', id],
    queryFn: () => apiFetch<AttemptDetail>(`/attempts/${id}/teacher-view`, { token: token! }),
    enabled: !!id && !!token,
  });

  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attempt?.answers) {
      const initFeedbacks: Record<string, string> = {};
      const initScores: Record<string, string> = {};
      for (const answer of attempt.answers) {
        initFeedbacks[answer.id] = answer.feedback ?? '';
        if (answer.score !== null && answer.score !== undefined) {
          initScores[answer.id] = String(answer.score);
        }
      }
      setFeedbacks(initFeedbacks);
      setScores(initScores);
    }
  }, [attempt]);

  useEffect(() => {
    if (lastCommand?.command === 'SAVE_GRADE' && !saveMutation.isPending) {
      saveMutation.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCommand]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!attempt) return;
      for (const answer of attempt.answers) {
        const scoreStr = scores[answer.id];
        const scoreVal = scoreStr ? parseFloat(scoreStr) : null;
        const feedback = feedbacks[answer.id] || null;
        await apiFetch(`/attempts/${id}/answers/${answer.id}/grade`, {
          method: 'POST',
          token: token!,
          body: { score: scoreVal, feedback },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempt-teacher', id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-pending-attempts'] });
      Alert.alert('Salvo', 'Correção salva com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível salvar.');
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: 56,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '500' }}>Voltar</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, flex: 1 }}>
              {studentName ?? 'Aluno'}
            </Text>
            {attempt && (
              <AttemptStatusBadge status={attempt.status} score={attempt.score} />
            )}
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          {(!attempt?.answers || attempt.answers.length === 0) ? (
            <View
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: 16,
                padding: 28,
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
              }}
            >
              <Ionicons name="document-text-outline" size={32} color={colors.text.tertiary} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 4 }}>
                Nenhuma resposta ainda
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>
                O aluno ainda não respondeu nenhuma questão desta tentativa.
              </Text>
            </View>
          ) : (
            <>
              {attempt.answers.map((answer, index) => (
                <View
                  key={answer.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                    Questão {index + 1}
                  </Text>

                  <Text style={{ fontSize: 15, color: colors.text.primary, lineHeight: 22 }}>
                    {answer.questionText}
                  </Text>

                  <View
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: 10,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.borderLight,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.tertiary, marginBottom: 6 }}>
                      RESPOSTA DO ALUNO
                    </Text>
                    {answer.selectedOptionId ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons
                          name={answer.isCorrectOption ? 'checkmark-circle' : 'close-circle'}
                          size={18}
                          color={answer.isCorrectOption ? colors.primary : colors.error}
                        />
                        <Text style={{ fontSize: 14, color: colors.text.primary, flex: 1 }}>
                          {answer.selectedOptionText ?? '(opção removida)'}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 14, color: answer.answerText ? colors.text.primary : colors.text.tertiary }}>
                        {answer.answerText ?? '(sem resposta)'}
                      </Text>
                    )}
                  </View>

                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.tertiary }}>
                      NOTA
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TextInput
                        value={scores[answer.id] ?? ''}
                        onChangeText={(v) => {
                          if (/^\d*\.?\d*$/.test(v)) setScores((prev) => ({ ...prev, [answer.id]: v }));
                        }}
                        keyboardType="decimal-pad"
                        placeholder="0–10"
                        placeholderTextColor={colors.text.tertiary}
                        style={{
                          width: 64,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                          padding: 8,
                          textAlign: 'center',
                          color: colors.text.primary,
                          fontSize: 15,
                          backgroundColor: colors.background,
                        }}
                      />
                      <Text style={{ color: colors.text.secondary, fontSize: 13 }}>/ 10</Text>
                    </View>
                  </View>

                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.tertiary }}>
                      COMENTÁRIO DO PROFESSOR
                    </Text>
                    <TextInput
                      value={feedbacks[answer.id] ?? ''}
                      onChangeText={(text) =>
                        setFeedbacks((prev) => ({ ...prev, [answer.id]: text }))
                      }
                      placeholder="Adicione um comentário ou feedback..."
                      placeholderTextColor={colors.text.tertiary}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 15,
                        color: colors.text.primary,
                        backgroundColor: colors.background,
                        minHeight: 80,
                        textAlignVertical: 'top',
                      }}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginTop: 8,
                  marginBottom: 16,
                  opacity: saveMutation.isPending ? 0.6 : 1,
                }}
                accessibilityLabel="Salvar correção"
                accessibilityRole="button"
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.inverse }}>
                    Salvar correção
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
