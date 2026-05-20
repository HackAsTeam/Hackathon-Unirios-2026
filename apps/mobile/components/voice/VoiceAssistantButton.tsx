import { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, AppState, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  cancelAnimation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useVoiceCommandStore, type VoiceCommandResponse } from '../../store/voiceCommand';
import { useAccessibilityStore } from '../../store/acessibility';
import { useAuthStore } from '../../store/auth';
import { startWakeWordDetection, stopWakeWordDetection } from '../../lib/wakeWord';
import { startListening } from '../../lib/stt';
import { isSpeaking } from '../../lib/tts';
import { dispatch } from '../../lib/voiceCommandDispatcher';
import { colors } from '../../lib/colors';
const diloAssistantImage = require('../../assets/dillo-assistant-image.png');

const ACCENT = colors.formats.oral;
const DOT_COLOR = '#22c55e';

interface Props {
  onScreenAction?: (cmd: VoiceCommandResponse) => void;
}

export function VoiceAssistantButton({ onScreenAction }: Props) {
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [inlineActive, setInlineActive] = useState(false);
  const [isForegrounded, setIsForegrounded] = useState(true);
  const isForegoundedRef = useRef(true);
  const inlineTranscriptRef = useRef('');
  const stopInlineSTTRef = useRef<(() => void) | null>(null);
  // Ref mantém a função sempre atualizada sem invalidar useCallback abaixo
  const startInlineListeningRef = useRef<() => void>(() => {});
  const {highContrast} = useAccessibilityStore();

  const token = useAuthStore((s) => s.token);
  const { reducedMotion, wakeWordEnabled } = useAccessibilityStore();

  const dotOpacity = useSharedValue(0);
  const dotScale = useSharedValue(1);

  const inlineDot1 = useSharedValue(0.3);
  const inlineDot2 = useSharedValue(0.3);
  const inlineDot3 = useSharedValue(0.3);

  // ─── Track app foreground/background ─────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      isForegoundedRef.current = state === 'active';
      setIsForegrounded(state === 'active');
    });
    return () => sub.remove();
  }, []);

  // ─── Inline STT (atualizado a cada render para capturar token/onScreenAction frescos) ───
  startInlineListeningRef.current = () => {
    setInlineActive(true);
    inlineTranscriptRef.current = '';
    console.log('[WakeWord] STT inline aguardando liberação do mic...');

    // 150ms para o AudioRecorder liberar o mic antes do STT tentar abrir
    setTimeout(() => {
      console.log('[WakeWord] STT inline iniciado — fale o comando');
      stopInlineSTTRef.current = startListening(
        ({ transcript }) => { inlineTranscriptRef.current = transcript; },
        async () => {
          stopInlineSTTRef.current = null;
          const text = inlineTranscriptRef.current.trim();
          console.log(`[WakeWord] STT inline encerrado — "${text}"`);
          if (text) {
            const { currentContext, setLastCommand } = useVoiceCommandStore.getState();
            // dispatch já chama speak() internamente — não chamar de novo
            const result = await dispatch(text, currentContext, token ?? null, onScreenAction);
            setLastCommand(result);
            // aguarda TTS iniciar (300ms) e terminar antes de rearmar ONNX
            await new Promise<void>((r) => setTimeout(r, 300));
            const deadline = Date.now() + 15_000;
            while (Date.now() < deadline) {
              if (!isSpeaking()) break;
              await new Promise<void>((r) => setTimeout(r, 200));
            }
          }
          setInlineActive(false);
        },
        (err) => {
          stopInlineSTTRef.current = null;
          if (err !== 'no-speech') console.warn(`[WakeWord] STT inline erro: ${err}`);
          setInlineActive(false);
        },
      );
    }, 150);
  };

  // ─── Wake word callback ───────────────────────────────────────────────────
  const handleWakeWordDetected = useCallback(() => {
    setWakeWordActive(false);
    console.log('[WakeWord] ONNX disparou → STT inline');
    startInlineListeningRef.current();
  }, []);

  // Callback para o modo STT fallback (sem ONNX)
  const handleInlineCommand = useCallback(async (transcript: string) => {
    setWakeWordActive(false);
    console.log(`[WakeWord] STT fallback inline: "${transcript}"`);
    const { currentContext, setLastCommand } = useVoiceCommandStore.getState();
    // dispatch já chama speak() internamente
    const result = await dispatch(transcript, currentContext, token ?? null, onScreenAction);
    setLastCommand(result);
  }, [token, onScreenAction]);

  // ─── Single effect — única fonte de verdade para o ciclo de wake word ────
  useEffect(() => {
    // inlineActive=true significa que o STT inline está capturando — não re-armar ONNX
    const shouldRun = wakeWordEnabled && isForegrounded && !inlineActive;

    if (!shouldRun) {
      stopWakeWordDetection();
      setWakeWordActive(false);
      return;
    }

    let cancelled = false;

    async function waitForTtsThenStart() {
      // Poll until TTS finishes (max 10 s), then add 500 ms buffer
      const deadline = Date.now() + 10_000;
      while (!cancelled && Date.now() < deadline) {
        if (!(await isSpeaking())) break;
        await new Promise<void>((r) => setTimeout(r, 200));
      }
      if (cancelled) return;
      await new Promise<void>((r) => setTimeout(r, 500));
      if (cancelled) return;
      const ok = await startWakeWordDetection(handleWakeWordDetected, handleInlineCommand);
      if (!cancelled) setWakeWordActive(ok);
    }

    const startTimer = setTimeout(waitForTtsThenStart, 300);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      stopWakeWordDetection();
      stopInlineSTTRef.current?.();
      stopInlineSTTRef.current = null;
      setWakeWordActive(false);
    };
  }, [wakeWordEnabled, isForegrounded, inlineActive, handleWakeWordDetected, handleInlineCommand]);

  // ─── Dot animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (wakeWordActive && !reducedMotion) {
      dotOpacity.value = 1;
      dotScale.value = withRepeat(
        withSequence(withTiming(1.4, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1,
        false,
      );
    } else {
      cancelAnimation(dotScale);
      dotOpacity.value = withTiming(wakeWordActive ? 1 : 0, { duration: 300 });
      dotScale.value = 1;
    }
  }, [wakeWordActive, reducedMotion]);

  // ─── Inline dots animation ────────────────────────────────────────────────
  useEffect(() => {
    if (inlineActive && !reducedMotion) {
      const anim = (sv: typeof inlineDot1, delay: number) => {
        sv.value = withDelay(delay, withRepeat(withTiming(1, { duration: 500 }), -1, true));
      };
      anim(inlineDot1, 0);
      anim(inlineDot2, 160);
      anim(inlineDot3, 320);
    } else {
      [inlineDot1, inlineDot2, inlineDot3].forEach((sv) => {
        cancelAnimation(sv);
        sv.value = withTiming(0.3, { duration: 200 });
      });
    }
  }, [inlineActive, reducedMotion]);

  // ─── Manual tap ──────────────────────────────────────────────────────────
  function openOverlay() {
    startInlineListeningRef.current();
  }

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));
  const inlineDot1Style = useAnimatedStyle(() => ({ opacity: inlineDot1.value }));
  const inlineDot2Style = useAnimatedStyle(() => ({ opacity: inlineDot2.value }));
  const inlineDot3Style = useAnimatedStyle(() => ({ opacity: inlineDot3.value }));

  const a11yLabel = wakeWordActive
    ? 'Assistente de voz ativo — diga Hey Dillo para ativar'
    : 'Assistente de voz';

  return (
    <>
      <View style={styles.fab}>
        <TouchableOpacity
          onPress={openOverlay}
          accessibilityLabel={a11yLabel}
          accessibilityRole="button"
          accessibilityHint="Toque para dar um comando por voz"
          style={[
            styles.button,
            { backgroundColor: highContrast ? "#000000" : '#ffffff', borderColor: ACCENT },
          ]}
        >
          <Image source={diloAssistantImage} style={{ width: 45, height: 45 }} />
        </TouchableOpacity>

        <Animated.View style={[styles.dot, dotStyle]}>
          <View style={[styles.dotInner, { backgroundColor: DOT_COLOR }]} />
        </Animated.View>
      </View>

      {inlineActive && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          pointerEvents="none"
          style={styles.inlinePillContainer}
        >
          <View style={styles.inlinePill}>
            {[inlineDot1Style, inlineDot2Style, inlineDot3Style].map((s, i) => (
              <Animated.View key={i} style={[styles.inlineDot, s]} />
            ))}
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  inlinePillContainer: {
    position: 'absolute',
    bottom: 170,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  inlinePill: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  inlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACCENT,
  },
});
