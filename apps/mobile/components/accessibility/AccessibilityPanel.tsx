import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibilityStore } from '../../store/acessibility';
import { colors } from '../../lib/colors';

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const scale = useSharedValue(1);

  const {
    highContrast,
    fontSizeScale,
    reducedMotion,
    prefersAudio,
    toggleHighContrast,
    setReducedMotion,
    setPrefersAudio,
    increaseFontSize,
    decreaseFontSize,
  } = useAccessibilityStore();

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function toggle() {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    setOpen((o) => !o);
  }

  const bg = highContrast ? '#000' : colors.surface;
  const textColor = highContrast ? '#fff' : colors.text.primary;
  const secondaryText = highContrast ? '#aaa' : colors.text.secondary;

  return (
    <>
      <Animated.View style={[{ position: 'absolute', bottom: 24, right: 20, zIndex: 99 }, btnStyle]}>
        <TouchableOpacity
          onPress={toggle}
          accessibilityLabel="Painel de acessibilidade"
          accessibilityRole="button"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.info,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.info,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 22 }}>♿</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => {}}>
            <View
              style={{
                backgroundColor: bg,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 24,
                paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                gap: 20,
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
              </View>

              <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>
                Acessibilidade
              </Text>

              <Row
                label="Alto contraste"
                icon="🌗"
                value={highContrast}
                onToggle={toggleHighContrast}
                highContrast={highContrast}
              />

              <Row
                label="Movimento reduzido"
                icon="🫧"
                value={reducedMotion}
                onToggle={() => setReducedMotion(!reducedMotion)}
                highContrast={highContrast}
              />

              <Row
                label="Preferência por áudio"
                icon="🔊"
                value={prefersAudio}
                onToggle={() => setPrefersAudio(!prefersAudio)}
                highContrast={highContrast}
              />

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Text style={{ fontSize: 20 }}>🔤</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: textColor, flex: 1 }}>
                    Tamanho da fonte
                  </Text>
                  <Text style={{ fontSize: 13, color: secondaryText }}>
                    {Math.round(fontSizeScale * 100)}%
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={decreaseFontSize}
                    accessibilityLabel="Diminuir fonte"
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: highContrast ? '#222' : colors.surfaceAlt,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 20, color: textColor }}>A−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={increaseFontSize}
                    accessibilityLabel="Aumentar fonte"
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: highContrast ? '#222' : colors.surfaceAlt,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 20, color: textColor }}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Row({
  label,
  icon,
  value,
  onToggle,
  highContrast,
}: {
  label: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
  highContrast: boolean;
}) {
  const textColor = highContrast ? '#fff' : colors.text.primary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: textColor, flex: 1 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#fff"
      />
    </View>
  );
}
