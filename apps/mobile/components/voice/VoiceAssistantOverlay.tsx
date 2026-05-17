import { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useVoiceCommandStore, type VoiceCommandResponse } from '../../store/voiceCommand';
import { useAccessibilityStore } from '../../store/acessibility';
import { requestSTTPermission, startListening, stopListening } from '../../lib/stt';
import { dispatch } from '../../lib/voiceCommandDispatcher';
import { useAuthStore } from '../../store/auth';
import { colors } from '../../lib/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScreenAction?: (cmd: VoiceCommandResponse) => void;
}

const ACCENT = colors.formats.oral;

export function VoiceAssistantOverlay({ visible, onClose, onScreenAction }: Props) {
  const { status, transcript, setStatus, setTranscript, setLastCommand, currentContext, reset } =
    useVoiceCommandStore();
  const { reducedMotion } = useAccessibilityStore();
  const token = useAuthStore((s) => s.token);

  const stopSTTRef = useRef<(() => void) | null>(null);
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    if (visible) startSession();
    return () => cleanup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function cleanup() {
    stopSTTRef.current?.();
    stopSTTRef.current = null;
    [dot1, dot2, dot3].forEach((sv) => cancelAnimation(sv));
  }

  function startDotAnimation() {
    if (reducedMotion) return;
    const animDot = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(delay, withRepeat(withTiming(1, { duration: 500 }), -1, true));
    };
    animDot(dot1, 0);
    animDot(dot2, 160);
    animDot(dot3, 320);
  }

  function stopDotAnimation() {
    [dot1, dot2, dot3].forEach((sv) => {
      cancelAnimation(sv);
      sv.value = withTiming(0.3);
    });
  }

  async function startSession() {
    reset();
    const granted = await requestSTTPermission();
    if (!granted) {
      onClose();
      return;
    }

    setStatus('listening');
    startDotAnimation();

    stopSTTRef.current = startListening(
      ({ transcript: text }) => setTranscript(text),
      () => finishListening(),
      () => finishListening(),
    );
  }

  async function finishListening() {
    stopDotAnimation();
    const currentTranscript = useVoiceCommandStore.getState().transcript;

    if (!currentTranscript.trim()) {
      setStatus('idle');
      onClose();
      return;
    }

    setStatus('processing');

    const result = await dispatch(currentTranscript, currentContext, token ?? null, onScreenAction);
    setLastCommand(result);
    setStatus('done');

    setTimeout(() => {
      reset();
      onClose();
    }, 1800);
  }

  function handleCancel() {
    stopListening();
    cleanup();
    reset();
    onClose();
  }

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  const lastCmd = useVoiceCommandStore((s) => s.lastCommand);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
      accessibilityViewIsModal
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={handleCancel} accessible={false} />

        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 28,
            paddingBottom: Platform.OS === 'ios' ? 48 : 28,
            alignItems: 'center',
            gap: 20,
            minHeight: 220,
          }}
        >
          {/* Drag handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb' }} />

          {status === 'listening' && (
            <>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {[dot1Style, dot2Style, dot3Style].map((s, i) => (
                  <Animated.View
                    key={i}
                    style={[{ width: 12, height: 12, borderRadius: 6, backgroundColor: ACCENT }, s]}
                  />
                ))}
              </View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#111', textAlign: 'center' }}>
                Ouvindo…
              </Text>
              {transcript.length > 0 && (
                <Text
                  style={{ fontSize: 15, color: '#555', textAlign: 'center', maxWidth: 300 }}
                  accessibilityLiveRegion="polite"
                >
                  {transcript}
                </Text>
              )}
              <TouchableOpacity
                onPress={handleCancel}
                accessibilityLabel="Cancelar assistente de voz"
                accessibilityRole="button"
                style={{
                  marginTop: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#6b7280' }}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'processing' && (
            <>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#111' }}>Processando…</Text>
              {transcript.length > 0 && (
                <Text style={{ fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 280 }}>
                  "{transcript}"
                </Text>
              )}
            </>
          )}

          {status === 'done' && lastCmd && (
            <>
              <Ionicons
                name={lastCmd.type === 'COMMAND' ? 'checkmark-circle' : 'help-circle'}
                size={48}
                color={lastCmd.type === 'COMMAND' ? colors.success : '#f59e0b'}
              />
              <Text
                style={{ fontSize: 15, color: '#374151', textAlign: 'center', maxWidth: 300 }}
                accessibilityLiveRegion="assertive"
              >
                {lastCmd.speak}
              </Text>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
