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
import { Audio } from 'expo-av';
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

type Stage = 'idle' | 'listening' | 'transcribing' | 'editing' | 'done';

const MOCK_TRANSCRIPTION_FRAGMENTS = [
  'Bem, ',
  'com base no que estudamos, ',
  'acredito que ',
  'a resposta para esta questão ',
  'envolve compreender ',
  'os conceitos fundamentais ',
  'e aplicá-los de forma clara. ',
  'É importante considerar ',
  'todos os aspectos apresentados ',
  'e organizar as ideias ',
  'de maneira coerente.',
];

export default function OralResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { reducedMotion } = useAccessibilityStore();
  const c = useColors();
  const scale = useScale();

  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

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
    onSuccess: () => setStage('done'),
    onError: () => Alert.alert('Erro', 'Não foi possível enviar.'),
  });

  const accentColor = c.formats.oral;
  const textFs = scale(15);

  useEffect(() => {
    return () => {
      stopTimer();
      clearTranscriptTimer();
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function clearTranscriptTimer() {
    if (transcriptTimerRef.current) { clearTimeout(transcriptTimerRef.current); transcriptTimerRef.current = null; }
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

  async function startListening() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos do microfone para ouvir você.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => setDuration(Date.now() - startTimeRef.current), 100);
      startListeningAnimation();
      setStage('listening');
    } catch {
      Alert.alert('Erro', 'Não foi possível acessar o microfone.');
    }
  }

  async function stopListening() {
    stopTimer();
    stopListeningAnimation();
    try {
      await recordingRef.current?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      recordingRef.current = null;
    } catch {}
    setStage('transcribing');
    simulateTranscription();
  }

  function simulateTranscription() {
    setTranscript('');
    let i = 0;
    let accumulated = '';
    function addFragment() {
      if (i >= MOCK_TRANSCRIPTION_FRAGMENTS.length) {
        setStage('editing');
        return;
      }
      accumulated += MOCK_TRANSCRIPTION_FRAGMENTS[i];
      setTranscript(accumulated);
      i++;
      transcriptTimerRef.current = setTimeout(addFragment, reducedMotion ? 30 : 180 + Math.random() * 120);
    }
    addFragment();
  }

  function resetAll() {
    stopTimer();
    clearTranscriptTimer();
    stopListeningAnimation();
    recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    recordingRef.current = null;
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 120 }}>
        <TouchableOpacity
          onPress={() => router.back()}
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
                onPress={stage === 'idle' ? startListening : stopListening}
                accessibilityLabel={stage === 'idle' ? 'Iniciar fala' : 'Parar fala'}
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

        {stage === 'transcribing' && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(300)} style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color={accentColor} size="small" />
              <Text style={{ fontSize: scale(15), color: accentColor, fontWeight: '600' }}>Transcrevendo…</Text>
            </View>
            <View style={{
              backgroundColor: c.surfaceAlt,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1.5,
              borderColor: accentColor + '30',
              minHeight: 140,
            }}>
              <Text style={{ fontSize: textFs, color: c.text.primary, lineHeight: textFs * 1.6 }}>
                {transcript}
                <Text style={{ color: accentColor }}>|</Text>
              </Text>
            </View>
          </Animated.View>
        )}

        {stage === 'editing' && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(300)} style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: scale(16), fontWeight: '700', color: c.text.primary }}>
                Revise e edite
              </Text>
              <TouchableOpacity onPress={resetAll} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="refresh-outline" size={16} color={accentColor} />
                <Text style={{ fontSize: scale(14), color: accentColor, fontWeight: '600' }}>Regravar</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={transcript}
              onChangeText={setTranscript}
              multiline
              textAlignVertical="top"
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
