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
import { useColors } from '../../../../hooks/useColors';
import { useScale } from '../../../../hooks/useScale';
import { AccessibilityPanel } from '../../../../components/accessibility/AccessibilityPanel';
import type { AttemptResponse, ExamDetail } from '../../../../types/classroom';

export default function TextResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { reducedMotion } = useAccessibilityStore();
  const c = useColors();
  const scale = useScale();

  const [answers, setAnswers] = useState<Record<string, string>>({});
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
        const text = answers[q.id]?.trim();
        if (text) {
          await apiFetch(`/attempts/${attempt.id}/answers`, {
            method: 'POST', token: token!,
            body: { questionId: q.id, answerText: text, format: 'Text' },
          });
        }
      }
      await apiFetch(`/attempts/${attempt.id}/submit`, { method: 'POST', token: token! });
    },
    onSuccess: () => setDone(true),
    onError: () => Alert.alert('Erro', 'Não foi possível enviar.'),
  });

  const accentColor = c.formats.text;
  const textFs = scale(15);
  const allAnswered = (exam?.questions ?? []).every((q) => (answers[q.id] ?? '').trim().length > 0);

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
            onPress={() => router.back()}
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
          style={{ gap: 8, marginBottom: 28 }}
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

        {exam && (
          <View style={{ gap: 24 }}>
            {exam.questions.map((q, i) => (
              <Animated.View
                key={q.id}
                entering={reducedMotion ? undefined : FadeInDown.delay(i * 80).duration(350)}
              >
                <View style={{
                  backgroundColor: c.surfaceAlt,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: accentColor + '20',
                }}>
                  <Text style={{ fontSize: scale(13), color: accentColor, fontWeight: '600', marginBottom: 4 }}>
                    Pergunta {i + 1}
                  </Text>
                  <Text style={{ fontSize: textFs, color: c.text.primary, lineHeight: textFs * 1.55 }}>
                    {q.text}
                  </Text>
                </View>

                <TextInput
                  value={answers[q.id] ?? ''}
                  onChangeText={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                  multiline
                  textAlignVertical="top"
                  placeholder="Digite sua resposta aqui…"
                  placeholderTextColor={c.text.tertiary}
                  accessibilityLabel={`Resposta para pergunta ${i + 1}`}
                  style={{
                    backgroundColor: c.surface,
                    borderRadius: 16,
                    padding: 18,
                    borderWidth: 1.5,
                    borderColor: (answers[q.id] ?? '').trim() ? accentColor + '50' : c.border,
                    fontSize: textFs,
                    color: c.text.primary,
                    lineHeight: textFs * 1.6,
                    minHeight: 120,
                  }}
                />
                <Text style={{ fontSize: scale(12), color: c.text.secondary, textAlign: 'right', marginTop: 4 }}>
                  {(answers[q.id] ?? '').length} caracteres
                </Text>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        backgroundColor: c.background, borderTopWidth: 1, borderTopColor: c.borderLight,
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
              <Text style={{ fontSize: scale(17), fontWeight: '700', color: '#fff' }}>Enviar resposta</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <AccessibilityPanel />
    </KeyboardAvoidingView>
  );
}
