import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
  FadeInDown,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
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
import { requestSTTPermission, startListening, stopListening } from '../../../../lib/stt';
import type { AttemptResponse, ExamDetail } from '../../../../types/classroom';

type Stage = 'idle' | 'listening' | 'editing' | 'done';

export default function OralResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useScreenContext({ screen: 'respond-oral', activityId: id, role: 'student' });
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { reducedMotion } = useAccessibilityStore();
  const c = useColors();
  const scale = useScale();

  const queryClient = useQueryClient();
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);
  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const stopSTTRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const isFocused = useIsFocused();
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);
  const ringScale = useSharedValue(1);

  const { data: exam } = useQuery({
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
      if (exam?.questions[0]) {
        await apiFetch(`/attempts/${attempt.id}/answers`, {
          method: 'POST', token: token!,
          body: { questionId: exam.questions[0].id, answerText: transcript, format: 'Oral' },
        });
      }
      await apiFetch(`/attempts/${attempt.id}/submit`, { method: 'POST', token: token! });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['student-activity-statuses'] });
      setStage('done');
    },
    onError: () => Alert.alert('Erro', 'Não foi possível enviar.'),
  });

  const accentColor = c.formats.oral;
  const textFs = scale(15);

  useEffect(() => {
    return () => {
      stopSTTRef.current?.();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!lastCommand || !isFocused) return;

    if (lastCommand.command === 'SUBMIT_ANSWER' && stage === 'editing' && transcript.trim() && !submitMutation.isPending) {
      submitMutation.mutate();
    }

    if (lastCommand.command === 'READ_ALOUD' && exam) {
      speak(exam.questions.map((q, i) => `Questão ${i + 1}: ${q.text}`).join('. '));
    }
  }, [lastCommand]);

  function startTimer() {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => setDuration(Date.now() - startTimeRef.current), 100);
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function startListeningAnimation() {
    if (reducedMotion) return;
    const animDot = (sv: SharedValue<number>, delay: number) => {
      sv.value = withDelay(delay, withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1, true
      ));
    };
    animDot(dot1, 0);
    animDot(dot2, 160);
    animDot(dot3, 320);
    ringScale.value = withRepeat(withTiming(1.15, { duration: 1200 }), -1, true);
  }

  function stopListeningAnimation() {
    [dot1, dot2, dot3, ringScale].forEach((sv) => cancelAnimation(sv));
    dot1.value = withTiming(0.3); dot2.value = withTiming(0.3); dot3.value = withTiming(0.3);
    ringScale.value = withSpring(1);
  }

  async function handleStartListening() {
    const granted = await requestSTTPermission();
    if (!granted) {
      Alert.alert('Permissão negada', 'Precisamos do microfone para ouvir você.');
      return;
    }

    setTranscript('');
    setStage('listening');
    startTimer();
    startListeningAnimation();

    stopSTTRef.current = startListening(
      ({ transcript: text }) => setTranscript(text),
      () => {
        stopTimer();
        stopListeningAnimation();
        setStage('editing');
        stopSTTRef.current = null;
      },
      (err) => {
        stopTimer();
        stopListeningAnimation();
        setStage('idle');
        stopSTTRef.current = null;
        if (err !== 'no-speech') {
          Alert.alert('Erro', 'Não foi possível transcrever. Tente novamente.');
        }
      },
    );
  }

  function handleStopListening() {
    stopListening();
    stopSTTRef.current = null;
    stopTimer();
    stopListeningAnimation();
    setStage('editing');
  }

  function resetAll() {
    stopSTTRef.current?.();
    stopSTTRef.current = null;
    stopTimer();
    stopListeningAnimation();
    setTranscript('');
    setDuration(0);
    setStage('idle');
  }

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringScale.value }] }));

  if (stage === 'done') {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)} style={{ alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={64} color={accentColor} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: scale(24), fontWeight: '800', color: c.text.primary, textAlign: 'center', letterSpacing: -0.4 }}>Resposta enviada!</Text>
          <Text style={{ fontSize: scale(15), color: c.text.secondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            Sua resposta oral foi registrada com sucesso.
          </Text>
          <TouchableOpacity
            onPress={() => exam?.subjectId ? router.replace(`/subject/${exam.subjectId}`) : router.back()}
            accessibilityLabel="Voltar"
            accessibilityRole="button"
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 120 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
        >
          <Ionicons name="arrow-back" size={20} color={accentColor} />
          <Text style={{ fontSize: scale(15), color: accentColor, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(400)}
          style={{ alignItems: 'center', gap: 8, marginBottom: 32 }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: accentColor + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={accentColor} />
          </View>
          <Text style={{ fontSize: scale(26), fontWeight: '800', color: c.text.primary, letterSpacing: -0.4, textAlign: 'center' }}>
            Resposta Oral
          </Text>
          {exam && (
            <Text style={{ fontSize: scale(14), color: c.text.secondary, textAlign: 'center', maxWidth: 280, lineHeight: 20 }}>
              {exam.title}
            </Text>
          )}
        </Animated.View>

        {(stage === 'idle' || stage === 'listening') && (
          <View style={{ alignItems: 'center', gap: 24 }}>
            <Animated.View style={ringStyle}>
              <TouchableOpacity
                onPress={stage === 'idle' ? handleStartListening : handleStopListening}
                accessibilityLabel={stage === 'idle' ? 'Iniciar fala' : 'Parar fala'}
                accessibilityRole="button"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: stage === 'listening' ? accentColor : accentColor + '18',
                  borderWidth: stage === 'listening' ? 0 : 2,
                  borderColor: accentColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: accentColor,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: stage === 'listening' ? 0.4 : 0.15,
                  shadowRadius: 20,
                  elevation: stage === 'listening' ? 10 : 4,
                }}
              >
                <Ionicons
                  name={stage === 'listening' ? 'stop' : 'mic'}
                  size={48}
                  color={stage === 'listening' ? '#fff' : accentColor}
                />
              </TouchableOpacity>
            </Animated.View>

            {stage === 'listening' && (
              <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(300)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[dot1Style, dot2Style, dot3Style].map((s, i) => (
                      <Animated.View key={i} style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor }, s]} />
                    ))}
                  </View>
                  <Text style={{ fontSize: scale(15), color: accentColor, fontWeight: '600' }}>
                    Ouvindo você…
                  </Text>
                </View>
                {transcript.length > 0 && (
                  <Text
                    style={{ fontSize: scale(13), color: c.text.secondary, marginTop: 12, textAlign: 'center', maxWidth: 280 }}
                    accessibilityLiveRegion="polite"
                  >
                    {transcript}
                  </Text>
                )}
                <Text style={{ fontSize: scale(13), color: c.text.secondary, textAlign: 'center', marginTop: 6 }}>
                  {Math.floor(duration / 1000)}s
                </Text>
              </Animated.View>
            )}

            {stage === 'idle' && (
              <Text style={{ fontSize: scale(15), color: c.text.secondary, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>
                Toque no botão e fale sua resposta. Vamos transcrever enquanto você fala.
              </Text>
            )}
          </View>
        )}

        {stage === 'editing' && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(300)} style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: scale(16), fontWeight: '700', color: c.text.primary }}>
                Revise e edite
              </Text>
              <TouchableOpacity
                onPress={resetAll}
                accessibilityLabel="Regravar resposta"
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="refresh-outline" size={16} color={accentColor} />
                <Text style={{ fontSize: scale(14), color: accentColor, fontWeight: '600' }}>Regravar</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={transcript}
              onChangeText={setTranscript}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Transcrição da resposta oral"
              style={{
                backgroundColor: c.surface,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1.5,
                borderColor: accentColor + '40',
                fontSize: textFs,
                color: c.text.primary,
                lineHeight: textFs * 1.6,
                minHeight: 160,
              }}
            />
            <Text style={{ fontSize: scale(13), color: c.text.secondary, textAlign: 'right' }}>
              {transcript.length} caracteres
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {stage === 'editing' && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
          backgroundColor: c.background, borderTopWidth: 1, borderTopColor: c.borderLight,
        }}>
          <TouchableOpacity
            onPress={() => transcript.trim() && submitMutation.mutate()}
            disabled={submitMutation.isPending || !transcript.trim()}
            accessibilityLabel="Enviar resposta oral"
            accessibilityRole="button"
            accessibilityState={{ disabled: submitMutation.isPending || !transcript.trim() }}
            style={{
              backgroundColor: accentColor,
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: (submitMutation.isPending || !transcript.trim()) ? 0.6 : 1,
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
      )}

      <AccessibilityPanel />
    </KeyboardAvoidingView>
  );
}
