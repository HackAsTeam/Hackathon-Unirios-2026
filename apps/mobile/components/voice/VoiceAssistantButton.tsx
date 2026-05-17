import { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { VoiceAssistantOverlay } from './VoiceAssistantOverlay';
import { useVoiceCommandStore, type VoiceCommandResponse } from '../../store/voiceCommand';
import { useAccessibilityStore } from '../../store/acessibility';
import { colors } from '../../lib/colors';

const ACCENT = colors.formats.oral;

interface Props {
  onScreenAction?: (cmd: VoiceCommandResponse) => void;
}

export function VoiceAssistantButton({ onScreenAction }: Props) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const status = useVoiceCommandStore((s) => s.status);
  const { reducedMotion } = useAccessibilityStore();

  const pulse = useSharedValue(1);

  function openOverlay() {
    setOverlayVisible(true);
    if (!reducedMotion) {
      pulse.value = withRepeat(withTiming(1.12, { duration: 900 }), -1, true);
    }
  }

  function closeOverlay() {
    setOverlayVisible(false);
    pulse.value = withTiming(1);
  }

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const isActive = overlayVisible || status === 'listening' || status === 'processing';

  return (
    <>
      <Animated.View style={[styles.fab, pulseStyle]}>
        <TouchableOpacity
          onPress={openOverlay}
          accessibilityLabel="Assistente de voz"
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
});
