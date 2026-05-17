import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/auth';
import { useAccessibilityStore } from '../../../../store/acessibility';
import { apiFetch } from '../../../../lib/api';
import { colors } from '../../../../lib/colors';
import { AccessibilityPanel } from '../../../../components/accessibility/AccessibilityPanel';
import type { AttemptResponse, ExamDetail } from '../../../../types/classroom';

export default function TextResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { highContrast, reducedMotion, fontSizeScale } = useAccessibilityStore();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const { data: exam, isLoading } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => apiFetch<ExamDetail>(`/exams/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const attempt = await apiFetch<AttemptResponse>('/attempts', {
        method: 'POST', token: token!,
        body: { examId: id },
      });
      for (const q of exam?.questions ?? []) {
        if (q.options.length > 0) {
          const selectedOptionId = mcAnswers[q.id];
          if (selectedOptionId) {
            await apiFetch(`/attempts/${attempt.id}/answers`, {
              method: 'POST', token: token!,
              body: { questionId: q.id, selectedOptionId },
            });
          }
        } else {
          const text = answers[q.id]?.trim();
          if (text) {
            await apiFetch(`/attempts/${attempt.id}/answers`, {
              method: 'POST', token: token!,
              body: { questionId: q.id, answerText: text, format: 'Text' },
            });
          }
        }
      }
      await apiFetch(`/attempts/${attempt.id}/submit`, { method: 'POST', token: token! });
    },
    onSuccess: () => setDone(true),
    onError: () => Alert.alert('Erro', 'Não foi possível enviar.'),
  });

  const bg = highContrast ? '#000' : colors.background;
  const textPrimary = highContrast ? '#fff' : colors.text.primary;
  const textSecondary = highContrast ? '#aaa' : colors.text.secondary;
  const accentColor = colors.formats.text;
  const baseFontSize = 15 * fontSizeScale;

  const allAnswered = (exam?.questions ?? []).every((q) =>
    q.options.length > 0
      ? !!mcAnswers[q.id]
      : (answers[q.id] ?? '').trim().length > 0
  );

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary, textAlign: 'center', letterSpacing: -0.4 }}>
            Resposta enviada!
          </Text>
          <Text style={{ fontSize: 15, color: textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            Sua resposta em texto foi registrada.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 32, backgroundColor: accentColor, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Voltar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
        >
          <Ionicons name="arrow-back" size={20} color={accentColor} />
          <Text style={{ fontSize: 15, color: accentColor, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(400)}
          style={{ gap: 8, marginBottom: 28 }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: accentColor + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Ionicons name="document-text-outline" size={28} color={accentColor} />
          </View>
          <Text style={{ fontSize: 26, fontWeight: '800', color: textPrimary, letterSpacing: -0.4 }}>
            Resposta em Texto
          </Text>
          {exam && (
            <Text style={{ fontSize: 14, color: textSecondary, lineHeight: 20 }}>
              {exam.title}
            </Text>
          )}
        </Animated.View>

        {isLoading && <ActivityIndicator color={accentColor} size="large" style={{ marginTop: 40 }} />}

        {exam && (
          <View style={{ gap: 24 }}>
            {exam.questions.map((q, i) => (
              <Animated.View
                key={q.id}
                entering={reducedMotion ? undefined : FadeInDown.delay(i * 80).duration(350)}
              >
                <View style={{
                  backgroundColor: highContrast ? '#111' : colors.surfaceAlt,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: accentColor + '20',
                }}>
                  <Text style={{ fontSize: 13, color: accentColor, fontWeight: '600', marginBottom: 4 }}>
                    Pergunta {i + 1}
                  </Text>
                  <Text style={{ fontSize: baseFontSize, color: textPrimary, lineHeight: baseFontSize * 1.55 }}>
                    {q.text}
                  </Text>
                </View>

                {q.options.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {[...q.options].sort((a, b) => a.orderIndex - b.orderIndex).map((opt) => {
                      const selected = mcAnswers[q.id] === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => setMcAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                          style={{
                            backgroundColor: selected ? accentColor + '15' : (highContrast ? '#111' : colors.surface),
                            borderRadius: 12,
                            padding: 14,
                            borderWidth: 1.5,
                            borderColor: selected ? accentColor : colors.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <View style={{
                            width: 20, height: 20, borderRadius: 10,
                            borderWidth: 2,
                            borderColor: selected ? accentColor : colors.text.tertiary,
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor }} />}
                          </View>
                          <Text style={{ fontSize: baseFontSize, color: textPrimary, flex: 1, lineHeight: baseFontSize * 1.4 }}>
                            {opt.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <>
                    <TextInput
                      value={answers[q.id] ?? ''}
                      onChangeText={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                      multiline
                      textAlignVertical="top"
                      placeholder="Digite sua resposta aqui…"
                      placeholderTextColor={colors.text.tertiary}
                      accessibilityLabel={`Resposta para pergunta ${i + 1}`}
                      style={{
                        backgroundColor: highContrast ? '#111' : colors.surface,
                        borderRadius: 16,
                        padding: 18,
                        borderWidth: 1.5,
                        borderColor: (answers[q.id] ?? '').trim() ? accentColor + '50' : colors.border,
                        fontSize: baseFontSize,
                        color: textPrimary,
                        lineHeight: baseFontSize * 1.6,
                        minHeight: 120,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: textSecondary, textAlign: 'right', marginTop: 4 }}>
                      {(answers[q.id] ?? '').length} caracteres
                    </Text>
                  </>
                )}
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        backgroundColor: bg, borderTopWidth: 1, borderTopColor: colors.borderLight,
      }}>
        <TouchableOpacity
          onPress={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || !allAnswered}
          style={{
            backgroundColor: accentColor,
            borderRadius: 18,
            paddingVertical: 18,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            opacity: (submitMutation.isPending || !allAnswered) ? 0.55 : 1,
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>Enviar resposta</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <AccessibilityPanel />
    </KeyboardAvoidingView>
  );
}
