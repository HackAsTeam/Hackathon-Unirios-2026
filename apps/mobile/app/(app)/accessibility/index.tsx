import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../lib/colors';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAccessibilityStore } from '../../../store/accessibility';

export default function AccessibilityScreen() {
  const router = useRouter();
  const {
    highContrast,
    fontSizeScale,
    reducedMotion,
    prefersAudio,
    prefersVisual,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    setReducedMotion,
    setPrefersAudio,
    setPrefersVisual,
    reset,
  } = useAccessibilityStore();

  return (
    <View style={{ flex: 1, backgroundColor: highContrast ? '#000' : colors.background }}>
      <Header
        title="Acessibilidade"
        subtitle="Ajuste a experiência para suas necessidades"
        showBack
      />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          <View
            style={{
              backgroundColor: colors.infoLight,
              borderRadius: 16,
              padding: 16,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.info }}>
              ♿ Personalize sua experiência
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
              Aqui você pode ajustar como o app se comporta visualmente e 
              funcionalmente. Todas as mudanças são aplicadas na hora.
            </Text>
          </View>

          <Card variant="elevated">
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>Alto Contraste</Text>
                  <Text style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 2 }}>
                    Aumenta o contraste de todas as cores
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={toggleHighContrast}
                  accessibilityLabel={`Alto contraste: ${highContrast ? 'ativado' : 'desativado'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: highContrast }}
                  style={{
                    width: 52,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: highContrast ? colors.primary : colors.border,
                    padding: 3,
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#fff',
                      alignSelf: highContrast ? 'flex-end' : 'flex-start',
                    }}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ height: 1, backgroundColor: colors.divider }} />

              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>Tamanho da Fonte</Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 2, marginBottom: 12 }}>
                  Aumente ou diminua o texto ({Math.round(fontSizeScale * 100)}%)
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={decreaseFontSize}
                    accessibilityLabel="Diminuir fonte"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: colors.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>A-</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      height: 8,
                      backgroundColor: colors.borderLight,
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${((fontSizeScale - 0.8) / 0.7) * 100}%`,
                        height: '100%',
                        backgroundColor: colors.primary,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={increaseFontSize}
                    accessibilityLabel="Aumentar fonte"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: colors.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: colors.divider }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>Movimento Reduzido</Text>
                  <Text style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 2 }}>
                    Reduz animações e transições
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setReducedMotion(!reducedMotion)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: reducedMotion }}
                  style={{
                    width: 52,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: reducedMotion ? colors.primary : colors.border,
                    padding: 3,
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#fff',
                      alignSelf: reducedMotion ? 'flex-end' : 'flex-start',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <Card variant="elevated">
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                Preferências de Aprendizagem
              </Text>
              <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                Isso ajuda a sugerir os melhores formatos para você
              </Text>

              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setPrefersAudio(!prefersAudio)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: prefersAudio ? colors.formatsLight.audio : colors.surfaceAlt,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1.5,
                    borderColor: prefersAudio ? colors.formats.audio : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🎧</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                      Prefiro explicar falando
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                      Áudio e resposta oral são mais confortáveis para mim
                    </Text>
                  </View>
                  {prefersAudio && <Text style={{ fontSize: 18, color: colors.formats.audio }}>✓</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPrefersVisual(!prefersVisual)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: prefersVisual ? colors.formatsLight.drawing : colors.surfaceAlt,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1.5,
                    borderColor: prefersVisual ? colors.formats.drawing : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>👁️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                      Prefiro respostas visuais
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                      Desenhos, mapas mentais e apresentações são ideais
                    </Text>
                  </View>
                  {prefersVisual && <Text style={{ fontSize: 18, color: colors.formats.drawing }}>✓</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <Button
            title="Redefinir padrões"
            onPress={reset}
            variant="outline"
            fullWidth
          />
        </View>
      </ScreenWrapper>
    </View>
  );
}
