import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  cancelAnimation,
  FadeInDown,
} from 'react-native-reanimated';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/auth';
import { useAccessibilityStore } from '../../../../store/acessibility';
import { useVoiceCommandStore } from '../../../../store/voiceCommand';
import { useScreenContext } from '../../../../hooks/useScreenContext';
import { apiFetch } from '../../../../lib/api';
import { useColors } from '../../../../hooks/useColors';
import { useScale } from '../../../../hooks/useScale';
import { WaveformVisualizer } from '../../../../components/response/WaveformVisualizer';
import { AccessibilityPanel } from '../../../../components/accessibility/AccessibilityPanel';
import type { AttemptResponse, ExamDetail } from '../../../../types/classroom';

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing' | 'submitting' | 'done';

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export default function AudioResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useScreenContext({ screen: 'respond-audio', activityId: id, role: 'student' });
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { reducedMotion } = useAccessibilityStore();
  const c = useColors();
  const scale = useScale();

  const queryClient = useQueryClient();
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [playPosition, setPlayPosition] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const pulseScale = useSharedValue(1);

  const { data: exam } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => apiFetch<ExamDetail>(`/exams/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const attempt = await apiFetch<AttemptResponse>('/attempts', {
        method: 'POST',
        token: token!,
        body: { examId: id },
      });
      if (exam?.questions[0]) {
        await apiFetch(`/attempts/${attempt.id}/answers`, {
          method: 'POST',
          token: token!,
          body: {
            questionId: exam.questions[0].id,
            answerText: `[Resposta em áudio gravada — duração: ${formatDuration(duration)}]`,
            format: 'Audio',
          },
        });
      }
      await apiFetch(`/attempts/${attempt.id}/submit`, {
        method: 'POST',
        token: token!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['student-activity-statuses'] });
      setState('done');
    },
    onError: () => Alert.alert('Erro', 'Não foi possível enviar. Tente novamente.'),
  });

  const accentColor = c.formats.audio;

  useEffect(() => {
    return () => { stopTimer(); };
  }, []);

  useEffect(() => {
    if (playerStatus.didJustFinish && state === 'playing') {
      setState('recorded');
      setPlayPosition(0);
    }
  }, [playerStatus.didJustFinish]);

  useEffect(() => {
    if (state === 'playing') {
      setPlayPosition(Math.round(playerStatus.currentTime * 1000));
    }
  }, [playerStatus.currentTime, state]);

  useEffect(() => {
    if (lastCommand?.command === 'SUBMIT_ANSWER' && (state === 'recorded' || state === 'playing') && !submitMutation.isPending) {
      submitMutation.mutate();
    }
  }, [lastCommand]);

  function startTimer() {
    startTime.current = Date.now() - duration;
    timerRef.current = setInterval(() => {
      setDuration(Date.now() - startTime.current);
    }, 100);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function animatePulse(on: boolean) {
    if (reducedMotion) return;
    if (on) {
      pulseScale.value = withRepeat(withTiming(1.12, { duration: 700 }), -1, true);
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withSpring(1);
    }
  }

  async function startRecording() {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permissão negada', 'Precisamos do microfone para gravar.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setDuration(0);
      startTimer();
      animatePulse(true);
      setState('recording');
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }

  async function stopRecording() {
    stopTimer();
    animatePulse(false);
    try {
      await audioRecorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      setState('recorded');
    } catch {
      setState('idle');
    }
  }

  function playRecording() {
    const uri = audioRecorder.uri;
    if (!uri) return;
    player.replace({ uri });
    player.play();
    setState('playing');
  }

  function stopPlayback() {
    player.pause();
    setState('recorded');
    setPlayPosition(0);
  }

  async function resetRecording() {
    stopTimer();
    animatePulse(false);
    if (state === 'playing') player.pause();
    if (state === 'recording') {
      try { await audioRecorder.stop(); } catch {}
    }
    setDuration(0);
    setPlayPosition(0);
    setState('idle');
  }

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (state === 'done') {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)}>
          <Ionicons name="checkmark-circle" size={64} color={accentColor} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: scale(24), fontWeight: '800', color: c.text.primary, textAlign: 'center', letterSpacing: -0.4 }}>
            Resposta enviada!
          </Text>
          <Text style={{ fontSize: scale(15), color: c.text.secondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            Seu áudio foi registrado com sucesso.
          </Text>
          <TouchableOpacity
            onPress={() => exam?.subjectId ? router.replace(`/subject/${exam.subjectId}`) : router.back()}
            style={{ marginTop: 32, backgroundColor: accentColor, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center' }}
          >
            <Text style={{ fontSize: scale(16), fontWeight: '700', color: '#fff' }}>Voltar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 120 }}
        scrollEnabled={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
        >
          <Ionicons name="arrow-back" size={20} color={accentColor} />
          <Text style={{ fontSize: scale(15), color: accentColor, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <Animated.View
            entering={reducedMotion ? undefined : FadeInDown.duration(400)}
            style={{ alignItems: 'center', gap: 8 }}
          >
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: accentColor + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <Ionicons name="mic-outline" size={28} color={accentColor} />
            </View>
            <Text style={{ fontSize: scale(26), fontWeight: '800', color: c.text.primary, letterSpacing: -0.4, textAlign: 'center' }}>
              Resposta em Áudio
            </Text>
            {exam && (
              <Text style={{ fontSize: scale(14), color: c.text.secondary, textAlign: 'center', maxWidth: 260, lineHeight: 20 }}>
                {exam.title}
              </Text>
            )}
          </Animated.View>

          <View style={{ alignItems: 'center', gap: 20, width: '100%' }}>
            <WaveformVisualizer
              active={state === 'recording'}
              color={accentColor}
              reducedMotion={reducedMotion}
            />

            <Text style={{
              fontSize: 44,
              fontWeight: '200',
              color: state === 'recording' ? accentColor : c.text.secondary,
              letterSpacing: 2,
              fontVariant: ['tabular-nums'],
            }}>
              {state === 'playing' ? formatDuration(playPosition) : formatDuration(duration)}
            </Text>

            <StatusLabel state={state} color={accentColor} textSecondary={c.text.secondary} />
          </View>

          <Animated.View style={pulseStyle}>
            <RecordButton
              state={state}
              color={accentColor}
              onPress={() => {
                if (state === 'idle') startRecording();
                else if (state === 'recording') stopRecording();
              }}
              reducedMotion={reducedMotion}
            />
          </Animated.View>

          {(state === 'recorded' || state === 'playing') && (
            <Animated.View
              entering={reducedMotion ? undefined : FadeInDown.duration(300)}
              style={{ flexDirection: 'row', gap: 12, width: '100%' }}
            >
              <TouchableOpacity
                onPress={resetRecording}
                accessibilityLabel="Regravar resposta"
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', gap: 6, flexDirection: 'row', justifyContent: 'center' }}
              >
                <Ionicons name="refresh-outline" size={18} color={c.text.secondary} />
                <Text style={{ fontSize: scale(15), fontWeight: '600', color: c.text.secondary }}>Regravar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={state === 'playing' ? stopPlayback : playRecording}
                accessibilityLabel={state === 'playing' ? 'Parar reprodução' : 'Ouvir gravação'}
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: accentColor + '18', borderWidth: 1.5, borderColor: accentColor + '40', alignItems: 'center', gap: 6, flexDirection: 'row', justifyContent: 'center' }}
              >
                <Ionicons name={state === 'playing' ? 'stop-outline' : 'play-outline'} size={18} color={accentColor} />
                <Text style={{ fontSize: scale(15), fontWeight: '600', color: accentColor }}>
                  {state === 'playing' ? 'Parar' : 'Ouvir'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {(state === 'recorded' || state === 'playing') && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
          backgroundColor: c.background, borderTopWidth: 1, borderTopColor: c.borderLight,
        }}>
          <TouchableOpacity
            onPress={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            style={{
              backgroundColor: accentColor,
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: submitMutation.isPending ? 0.7 : 1,
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
    </View>
  );
}

function StatusLabel({ state, color, textSecondary }: { state: RecordingState; color: string; textSecondary: string }) {
  const scale = useScale();
  const labels: Partial<Record<RecordingState, string>> = {
    idle: 'Toque para começar',
    recording: 'Gravando…',
    recorded: 'Gravação concluída',
    playing: 'Reproduzindo…',
  };
  const label = labels[state];
  if (!label) return null;
  return (
    <Text style={{ fontSize: scale(15), color: state === 'recording' ? color : textSecondary, fontWeight: state === 'recording' ? '600' : '400' }}>
      {label}
    </Text>
  );
}

function RecordButton({
  state,
  color,
  onPress,
  reducedMotion,
}: {
  state: RecordingState;
  color: string;
  onPress: () => void;
  reducedMotion: boolean;
}) {
  const animScale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: animScale.value }] }));
  const isRecording = state === 'recording';
  const disabled = state === 'recorded' || state === 'playing' || state === 'submitting';

  function handlePress() {
    if (!reducedMotion) {
      animScale.value = withSpring(0.92, { damping: 12 }, () => { animScale.value = withSpring(1); });
    }
    onPress();
  }

  return (
    <Animated.View style={animated}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
        accessibilityRole="button"
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: isRecording ? '#EF4444' : color,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
          shadowColor: isRecording ? '#EF4444' : color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <Ionicons name={isRecording ? 'stop' : 'mic'} size={42} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}
