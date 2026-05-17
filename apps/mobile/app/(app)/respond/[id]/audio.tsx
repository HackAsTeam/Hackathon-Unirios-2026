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
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/auth';
import { useAccessibilityStore } from '../../../../store/acessibility';
import { apiFetch } from '../../../../lib/api';
import { colors } from '../../../../lib/colors';
import { WaveformVisualizer } from '../../../../components/response/WaveformVisualizer';
import { AccessibilityPanel } from '../../../../components/accessibility/AccessibilityPanel';
import type { AttemptResponse, ExamDetail } from '../../../../types/classroom';
import { useQuery } from '@tanstack/react-query';

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing' | 'submitting' | 'done';

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export default function AudioResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { highContrast, reducedMotion } = useAccessibilityStore();

  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [playPosition, setPlayPosition] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordedUri = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

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
    onSuccess: () => setState('done'),
    onError: () => Alert.alert('Erro', 'Não foi possível enviar. Tente novamente.'),
  });

  const bg = highContrast ? '#000' : colors.background;
  const textPrimary = highContrast ? '#fff' : colors.text.primary;
  const textSecondary = highContrast ? '#aaa' : colors.text.secondary;
  const accentColor = colors.formats.audio;

  useEffect(() => {
    return () => {
      stopTimer();
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {});
      if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
    };
  }, []);

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
      pulseScale.value = withRepeat(
        withTiming(1.12, { duration: 700 }),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withSpring(1);
    }
  }

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos do microfone para gravar.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
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
      await recordingRef.current?.stopAndUnloadAsync();
      recordedUri.current = recordingRef.current?.getURI() ?? null;
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      setState('recorded');
    } catch {
      setState('idle');
    }
  }

  async function playRecording() {
    if (!recordedUri.current) return;
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri.current },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPlayPosition(status.positionMillis ?? 0);
            if (status.didJustFinish) {
              setState('recorded');
              setPlayPosition(0);
            }
          }
        }
      );
      soundRef.current = sound;
      setState('playing');
    } catch {
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
    }
  }

  async function stopPlayback() {
    await soundRef.current?.stopAsync();
    setState('recorded');
    setPlayPosition(0);
  }

  function resetRecording() {
    stopTimer();
    animatePulse(false);
    if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
    if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {});
    recordedUri.current = null;
    setDuration(0);
    setPlayPosition(0);
    setState('idle');
  }

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (state === 'done') {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)}>
          <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>🎉</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary, textAlign: 'center', letterSpacing: -0.4 }}>
            Resposta enviada!
          </Text>
          <Text style={{ fontSize: 15, color: textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            Seu áudio foi registrado com sucesso.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 32, backgroundColor: accentColor, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Voltar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 120 }}
        scrollEnabled={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
        >
          <Ionicons name="arrow-back" size={20} color={accentColor} />
          <Text style={{ fontSize: 15, color: accentColor, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <Animated.View
            entering={reducedMotion ? undefined : FadeInDown.duration(400)}
            style={{ alignItems: 'center', gap: 8 }}
          >
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: accentColor + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <Ionicons name="mic-outline" size={28} color={accentColor} />
            </View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: textPrimary, letterSpacing: -0.4, textAlign: 'center' }}>
              Resposta em Áudio
            </Text>
            {exam && (
              <Text style={{ fontSize: 14, color: textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 20 }}>
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
              color: state === 'recording' ? accentColor : textSecondary,
              letterSpacing: 2,
              fontVariant: ['tabular-nums'],
            }}>
              {state === 'playing' ? formatDuration(playPosition) : formatDuration(duration)}
            </Text>

            <StatusLabel state={state} color={accentColor} textSecondary={textSecondary} />
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
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', gap: 6, flexDirection: 'row', justifyContent: 'center' }}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.text.secondary} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: textSecondary }}>Regravar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={state === 'playing' ? stopPlayback : playRecording}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: accentColor + '18', borderWidth: 1.5, borderColor: accentColor + '40', alignItems: 'center', gap: 6, flexDirection: 'row', justifyContent: 'center' }}
              >
                <Ionicons name={state === 'playing' ? 'stop-outline' : 'play-outline'} size={18} color={accentColor} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: accentColor }}>
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
          backgroundColor: bg, borderTopWidth: 1, borderTopColor: colors.borderLight,
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
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>Enviar resposta</Text>
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
  const labels: Partial<Record<RecordingState, string>> = {
    idle: 'Toque para começar',
    recording: 'Gravando…',
    recorded: 'Gravação concluída',
    playing: 'Reproduzindo…',
  };
  const label = labels[state];
  if (!label) return null;
  return (
    <Text style={{ fontSize: 15, color: state === 'recording' ? color : textSecondary, fontWeight: state === 'recording' ? '600' : '400' }}>
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
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isRecording = state === 'recording';
  const disabled = state === 'recorded' || state === 'playing' || state === 'submitting';

  function handlePress() {
    if (!reducedMotion) {
      scale.value = withSpring(0.92, { damping: 12 }, () => { scale.value = withSpring(1); });
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
