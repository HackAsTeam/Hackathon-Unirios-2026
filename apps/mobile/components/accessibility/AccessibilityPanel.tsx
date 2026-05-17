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
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibilityStore } from '../../store/acessibility';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const animScale = useSharedValue(1);

  const {
    fontSizeScale,
    reducedMotion,
    prefersAudio,
    toggleHighContrast,
    setReducedMotion,
    setPrefersAudio,
    increaseFontSize,
    decreaseFontSize,
  } = useAccessibilityStore();

  const c = useColors();
  const scale = useScale();

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animScale.value }],
  }));

  function toggle() {
    animScale.value = withSpring(0.9, {}, () => {
      animScale.value = withSpring(1);
    });
    setOpen((o) => !o);
  }

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
            backgroundColor: c.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: c.primaryDark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="accessibility" size={22} color="#fff" />
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
                backgroundColor: c.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 24,
                paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                gap: 20,
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
              </View>

              <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary }}>
                Acessibilidade
              </Text>

              <Row
                label="Alto contraste"
                iconName="contrast-outline"
                value={useAccessibilityStore.getState().highContrast}
                onToggle={toggleHighContrast}
              />

              <Row
                label="Movimento reduzido"
                iconName="pulse-outline"
                value={reducedMotion}
                onToggle={() => setReducedMotion(!reducedMotion)}
              />

              <Row
                label="Preferência por áudio"
                iconName="volume-high-outline"
                value={prefersAudio}
                onToggle={() => setPrefersAudio(!prefersAudio)}
              />

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Ionicons name="text-outline" size={20} color={c.text.primary} />
                  <Text style={{ fontSize: scale(15), fontWeight: '600', color: c.text.primary, flex: 1 }}>
                    Tamanho da fonte
                  </Text>
                  <Text style={{ fontSize: scale(13), color: c.text.secondary }}>
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
                      backgroundColor: c.surfaceAlt,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: c.border,
                    }}
                  >
                    <Text style={{ fontSize: scale(20), color: c.text.primary }}>A−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={increaseFontSize}
                    accessibilityLabel="Aumentar fonte"
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: c.surfaceAlt,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: c.border,
                    }}
                  >
                    <Text style={{ fontSize: scale(20), color: c.text.primary }}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: c.primary,
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: scale(16), fontWeight: '700', color: '#fff' }}>Fechar</Text>
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
  iconName,
  value,
  onToggle,
}: {
  label: string;
  iconName: string;
  value: boolean;
  onToggle: () => void;
}) {
  const c = useColors();
  const scale = useScale();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={iconName as any} size={20} color={c.text.primary} />
      <Text style={{ fontSize: scale(15), fontWeight: '600', color: c.text.primary, flex: 1 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: c.primary, false: c.border }}
        thumbColor="#fff"
      />
    </View>
  );
}
