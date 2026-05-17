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
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { colors } from '@/lib/colors';
import { AttemptStatusBadge } from '@/components/student/AttemptStatusBadge';
import type { AttemptDetail } from '@/types/attempt';

export default function TeacherAttemptDetailScreen() {
  const { id, studentName } = useLocalSearchParams<{ id: string; studentName: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['attempt-teacher', id],
    queryFn: () => apiFetch<AttemptDetail>(`/attempts/${id}/teacher-view`, { token: token! }),
    enabled: !!id && !!token,
  });

  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attempt?.answers) {
      const initial: Record<string, string> = {};
      for (const answer of attempt.answers) {
        initial[answer.id] = answer.feedback ?? '';
      }
      setFeedbacks(initial);
    }
  }, [attempt]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!attempt) return;
      await Promise.all(
        attempt.answers.map((answer) =>
          apiFetch(`/attempts/${id}/answers/${answer.id}/grade`, {
            method: 'POST',
            token: token!,
            body: { score: null, feedback: feedbacks[answer.id] || null },
          })
        )
      );
    },
    onSuccess: () => {
      Alert.alert('Salvo', 'Comentários salvos com sucesso.');
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível salvar os comentários.');
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
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

      {/* Body */}
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
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 4 }}
              >
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                      Questão {index + 1}
                    </Text>
                  </View>

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
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.tertiary, marginBottom: 4 }}>
                      RESPOSTA DO ALUNO
                    </Text>
                    <Text style={{ fontSize: 14, color: answer.answerText ? colors.text.primary : colors.text.tertiary }}>
                      {answer.answerText
                        ? answer.answerText
                        : answer.selectedOptionId
                          ? '[Múltipla escolha]'
                          : '—'}
                    </Text>
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
                accessibilityLabel="Salvar comentários"
                accessibilityRole="button"
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.inverse }}>
                    Salvar comentários
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
