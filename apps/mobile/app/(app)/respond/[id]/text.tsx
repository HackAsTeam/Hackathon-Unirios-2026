import { useState, useEffect } from 'react';
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
import Animated, { FadeInRight, FadeInLeft, FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/auth';
import { useAccessibilityStore } from '../../../../store/acessibility';
import { useVoiceCommandStore } from '../../../../store/voiceCommand';
import { useScreenContext } from '../../../../hooks/useScreenContext';
import { speak } from '../../../../lib/tts';
import { apiFetch } from '../../../../lib/api';
import { useColors } from '../../../../hooks/useColors';
import { useScale } from '../../../../hooks/useScale';
import { AccessibilityPanel } from '../../../../components/accessibility/AccessibilityPanel';
import type { AttemptResponse, ExamDetail } from '../../../../types/classroom';

export default function TextResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useScreenContext({ screen: 'respond-text', activityId: id, role: 'student' });
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { reducedMotion } = useAccessibilityStore();
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);
  const c = useColors();
  const scale = useScale();

  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward');
  const [done, setDone] = useState(false);
  const isFocused = useIsFocused();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['student-activity-statuses'] });
      setDone(true);
    },
    onError: () => Alert.alert('Erro', 'Não foi possível enviar.'),
  });

  const questions = exam?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  function isCurrentAnswered() {
    if (!currentQuestion) return false;
    if (currentQuestion.options.length > 0) return !!mcAnswers[currentQuestion.id];
    return (answers[currentQuestion.id] ?? '').trim().length > 0;
  }

  const allAnswered = questions.every((q) =>
    q.options.length > 0
      ? !!mcAnswers[q.id]
      : (answers[q.id] ?? '').trim().length > 0
  );

  function goNext() {
    if (currentIndex < totalQuestions - 1) {
      setSlideDir('forward');
      setCurrentIndex((i) => i + 1);
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setSlideDir('back');
      setCurrentIndex((i) => i - 1);
    }
  }

  useEffect(() => {
    if (!lastCommand || !isFocused) return;

    if (lastCommand.command === 'SUBMIT_ANSWER' && !done && !submitMutation.isPending) {
      if (allAnswered) {
        submitMutation.mutate();
      } else {
        speak('Responda todas as questões antes de enviar.');
      }
    }

    if (lastCommand.command === 'SELECT_ALTERNATIVE' && currentQuestion) {
      const letter = (lastCommand.payload?.optionLetter as string | undefined)?.toUpperCase();
      const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      const optIndex = letter !== undefined ? letterMap[letter] : undefined;
      if (optIndex !== undefined && currentQuestion.options.length > 0) {
        const sorted = [...currentQuestion.options].sort((a, b) => a.orderIndex - b.orderIndex);
        const option = sorted[optIndex];
        if (option) {
          setMcAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }));
        } else {
          speak(`Esta questão não tem alternativa ${letter}.`);
        }
      }
    }

    if (lastCommand.command === 'NEXT_QUESTION') {
      if (!isLastQuestion) {
        goNext();
      } else {
        speak('Esta é a última questão.');
      }
    }

    if (lastCommand.command === 'PREV_QUESTION') {
      if (!isFirstQuestion) {
        goBack();
      } else {
        speak('Esta é a primeira questão.');
      }
    }

    if (lastCommand.command === 'READ_ALOUD' && currentQuestion) {
      const parts = [`Questão ${currentIndex + 1}: ${currentQuestion.text}`];
      if (currentQuestion.options.length > 0) {
        const letters = ['A', 'B', 'C', 'D'];
        const sorted = [...currentQuestion.options].sort((a, b) => a.orderIndex - b.orderIndex);
        sorted.forEach((opt, j) => parts.push(`${letters[j] ?? j + 1}: ${opt.text}`));
      }
      speak(parts.join('. '));
    }
  }, [lastCommand]);

  const accentColor = c.formats.text;
  const textFs = scale(15);

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)} style={{ alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={64} color={accentColor} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: scale(24), fontWeight: '800', color: c.text.primary, textAlign: 'center', letterSpacing: -0.4 }}>
            Resposta enviada!
          </Text>
          <Text style={{ fontSize: scale(15), color: c.text.secondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            Sua resposta em texto foi registrada.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(app)/(tabs)/pendencias')}
            style={{ marginTop: 32, backgroundColor: accentColor, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40 }}
          >
            <Text style={{ fontSize: scale(16), fontWeight: '700', color: '#fff' }}>Voltar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
        >
          <Ionicons name="arrow-back" size={20} color={accentColor} />
          <Text style={{ fontSize: scale(15), color: accentColor, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(400)}
          style={{ gap: 8, marginBottom: 24 }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: accentColor + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Ionicons name="document-text-outline" size={28} color={accentColor} />
          </View>
          <Text style={{ fontSize: scale(26), fontWeight: '800', color: c.text.primary, letterSpacing: -0.4 }}>
            Resposta em Texto
          </Text>
          {exam && (
            <Text style={{ fontSize: scale(14), color: c.text.secondary, lineHeight: 20 }}>
              {exam.title}
            </Text>
          )}
        </Animated.View>

        {isLoading && <ActivityIndicator color={accentColor} size="large" style={{ marginTop: 40 }} />}

        {exam && totalQuestions > 0 && (
          <>
            <View style={{ marginBottom: 16, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: scale(13), color: c.text.secondary, fontWeight: '600' }}>
                  Pergunta {currentIndex + 1} de {totalQuestions}
                </Text>
                <Text style={{ fontSize: scale(13), color: accentColor, fontWeight: '600' }}>
                  {questions.filter((q) =>
                    q.options.length > 0 ? !!mcAnswers[q.id] : (answers[q.id] ?? '').trim().length > 0
                  ).length}/{totalQuestions} respondidas
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {questions.map((q, i) => {
                  const answered = q.options.length > 0 ? !!mcAnswers[q.id] : (answers[q.id] ?? '').trim().length > 0;
                  return (
                    <View
                      key={q.id}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: i === currentIndex
                          ? accentColor
                          : answered
                            ? accentColor + '60'
                            : c.borderLight,
                      }}
                    />
                  );
                })}
              </View>
            </View>

            <Animated.View
              key={currentIndex}
              entering={reducedMotion ? undefined : (slideDir === 'forward' ? FadeInRight : FadeInLeft).duration(280)}
              style={{ gap: 16 }}
            >
              <View style={{
                backgroundColor: c.surfaceAlt,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: accentColor + '20',
              }}>
                <Text style={{ fontSize: scale(13), color: accentColor, fontWeight: '600', marginBottom: 4 }}>
                  Pergunta {currentIndex + 1}
                </Text>
                <Text style={{ fontSize: textFs, color: c.text.primary, lineHeight: textFs * 1.55 }}>
                  {currentQuestion?.text}
                </Text>
              </View>

              {currentQuestion && currentQuestion.options.length > 0 ? (
                <View style={{ gap: 8 }}>
                  {[...currentQuestion.options]
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((opt) => {
                      const selected = mcAnswers[currentQuestion.id] === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => setMcAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt.id }))}
                          style={{
                            backgroundColor: selected ? accentColor + '15' : c.surface,
                            borderRadius: 12,
                            padding: 14,
                            borderWidth: 1.5,
                            borderColor: selected ? accentColor : c.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <View style={{
                            width: 20, height: 20, borderRadius: 10,
                            borderWidth: 2,
                            borderColor: selected ? accentColor : c.text.tertiary,
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor }} />}
                          </View>
                          <Text style={{ fontSize: textFs, color: c.text.primary, flex: 1, lineHeight: textFs * 1.4 }}>
                            {opt.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              ) : currentQuestion ? (
                <>
                  <TextInput
                    value={answers[currentQuestion.id] ?? ''}
                    onChangeText={(v) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: v }))}
                    multiline
                    textAlignVertical="top"
                    placeholder="Digite sua resposta aqui…"
                    placeholderTextColor={c.text.tertiary}
                    accessibilityLabel={`Resposta para pergunta ${currentIndex + 1}`}
                    style={{
                      backgroundColor: c.surface,
                      borderRadius: 16,
                      padding: 18,
                      borderWidth: 1.5,
                      borderColor: (answers[currentQuestion.id] ?? '').trim() ? accentColor + '50' : c.border,
                      fontSize: textFs,
                      color: c.text.primary,
                      lineHeight: textFs * 1.6,
                      minHeight: 160,
                    }}
                  />
                  <Text style={{ fontSize: scale(12), color: c.text.secondary, textAlign: 'right', marginTop: -8 }}>
                    {(answers[currentQuestion.id] ?? '').length} caracteres
                  </Text>
                </>
              ) : null}
            </Animated.View>
          </>
        )}
      </ScrollView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        backgroundColor: c.background, borderTopWidth: 1, borderTopColor: c.borderLight,
        flexDirection: 'row', gap: 12,
      }}>
        {!isFirstQuestion && (
          <TouchableOpacity
            onPress={goBack}
            accessibilityLabel="Pergunta anterior"
            accessibilityRole="button"
            style={{
              paddingVertical: 18,
              paddingHorizontal: 20,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: c.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={20} color={c.text.secondary} />
          </TouchableOpacity>
        )}

        {!isLastQuestion ? (
          <TouchableOpacity
            onPress={goNext}
            disabled={!isCurrentAnswered()}
            accessibilityLabel="Próxima pergunta"
            accessibilityRole="button"
            style={{
              flex: 1,
              backgroundColor: accentColor,
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: isCurrentAnswered() ? 1 : 0.45,
            }}
          >
            <Text style={{ fontSize: scale(17), fontWeight: '700', color: '#fff' }}>Próxima</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || !allAnswered}
            accessibilityLabel="Enviar resposta"
            accessibilityRole="button"
            accessibilityState={{ disabled: submitMutation.isPending || !allAnswered }}
            style={{
              flex: 1,
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
                <Text style={{ fontSize: scale(17), fontWeight: '700', color: '#fff' }}>Enviar resposta</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <AccessibilityPanel />
    </KeyboardAvoidingView>
  );
}
