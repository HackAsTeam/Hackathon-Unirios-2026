import { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View, AppState } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { VoiceAssistantOverlay } from './VoiceAssistantOverlay';
import { useVoiceCommandStore, type VoiceCommandResponse } from '../../store/voiceCommand';
import { useAccessibilityStore } from '../../store/acessibility';
import { startWakeWordDetection, stopWakeWordDetection } from '../../lib/wakeWord';
import { speak, isSpeaking } from '../../lib/tts';
import { colors } from '../../lib/colors';

const ACCENT = colors.formats.oral;
const DOT_COLOR = '#22c55e';

interface Props {
  onScreenAction?: (cmd: VoiceCommandResponse) => void;
}

export function VoiceAssistantButton({ onScreenAction }: Props) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [isForegrounded, setIsForegrounded] = useState(true);

  const status = useVoiceCommandStore((s) => s.status);
  const { reducedMotion, wakeWordEnabled } = useAccessibilityStore();

  const pulse = useSharedValue(1);
  const dotOpacity = useSharedValue(0);
  const dotScale = useSharedValue(1);

  // ─── Track app foreground/background ─────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setIsForegrounded(state === 'active');
    });
    return () => sub.remove();
  }, []);

  // ─── Wake word callback ───────────────────────────────────────────────────
  const handleWakeWordDetected = useCallback(() => {
    setWakeWordActive(false);
    speak('Sim?');
    setTimeout(() => setOverlayVisible(true), 400);
  }, []);

  // ─── Single effect — única fonte de verdade para o ciclo de wake word ────
  useEffect(() => {
    const shouldRun = wakeWordEnabled && !overlayVisible && isForegrounded;

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
      const ok = await startWakeWordDetection(handleWakeWordDetected);
      if (!cancelled) setWakeWordActive(ok);
    }

    const startTimer = setTimeout(waitForTtsThenStart, 300);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      stopWakeWordDetection();
      setWakeWordActive(false);
    };
  }, [wakeWordEnabled, overlayVisible, isForegrounded, handleWakeWordDetected]);

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

  // ─── Manual tap ──────────────────────────────────────────────────────────
  function openOverlay() {
    setOverlayVisible(true);
    if (!reducedMotion) {
      pulse.value = withRepeat(withTiming(1.12, { duration: 900 }), -1, true);
    }
  }

  function closeOverlay() {
    setOverlayVisible(false);
    cancelAnimation(pulse);
    pulse.value = withTiming(1);
  }

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const isActive = overlayVisible || status === 'listening' || status === 'processing';

  const a11yLabel = wakeWordActive
    ? 'Assistente de voz ativo — diga Hey Dillo para ativar'
    : 'Assistente de voz';

  return (
    <>
      <Animated.View style={[styles.fab, pulseStyle]}>
        <TouchableOpacity
          onPress={openOverlay}
          accessibilityLabel={a11yLabel}
          accessibilityRole="button"
          accessibilityHint="Toque para dar um comando por voz"
          style={[
            styles.button,
            { backgroundColor: isActive ? ACCENT : '#fff', borderColor: ACCENT },
          ]}
        >
          <Ionicons
            name={isActive ? 'mic' : 'mic-outline'}
            size={26}
            color={isActive ? '#fff' : ACCENT}
          />
        </TouchableOpacity>

        <Animated.View style={[styles.dot, dotStyle]}>
          <View style={[styles.dotInner, { backgroundColor: DOT_COLOR }]} />
        </Animated.View>
      </Animated.View>

      <VoiceAssistantOverlay
        visible={overlayVisible}
        onClose={closeOverlay}
        onScreenAction={onScreenAction}
      />
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
});
