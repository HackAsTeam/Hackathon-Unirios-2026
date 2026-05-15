import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../lib/colors';
import { useActivityStore } from '../../../../store/activity';
import { getActivityById } from '../../../../lib/mock-data';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/layout/ScreenWrapper';
import { LearningObjective } from '../../../../components/activity/LearningObjective';
import { Button } from '../../../../components/ui/Button';
import { Chip } from '../../../../components/ui/Chip';

type DrawingMode = 'drawing' | 'mindmap';

const tools = ['✏️', '🖌️', '🖍️', '📏', '🔵', '🟢', '🔴', '🟡'];

export default function DrawingResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [mode, setMode] = useState<DrawingMode>('drawing');
  const [lines, setLines] = useState<{ color: string; width: number }[]>([]);
  const [selectedColor, setSelectedColor] = useState('#000');

  function handleContinue() {
    setResponseContent({ mode, lines, color: selectedColor });
    router.push(`/(app)/activity/submit/${id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={mode === 'drawing' ? 'Desenho' : 'Mapa Mental'}
        subtitle={mode === 'drawing' ? '🎨 Desenhe sua resposta' : '🧠 Crie seu mapa mental'}
        showBack
      />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip
              label="🎨 Desenho"
              color={colors.formats.drawing}
              lightColor={colors.formatsLight.drawing}
              selected={mode === 'drawing'}
              onPress={() => setMode('drawing')}
            />
            <Chip
              label="🧠 Mapa Mental"
              color={colors.formats.mindmap}
              lightColor={colors.formatsLight.mindmap}
              selected={mode === 'mindmap'}
              onPress={() => setMode('mindmap')}
            />
          </View>

          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              height: 360,
              borderWidth: 2,
              borderColor: mode === 'drawing' ? colors.formats.drawing + '30' : colors.formats.mindmap + '30',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 48, opacity: 0.3 }}>
              {mode === 'drawing' ? '🎨' : '🧠'}
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.tertiary, marginTop: 8 }}>
              {mode === 'drawing'
                ? 'Toque para começar a desenhar'
                : 'Toque para adicionar ideias ao mapa'}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.tertiary }}>
              CORES
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {tools.slice(0, 8).map((tool, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{tool}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {mode === 'mindmap' && (
            <View style={{
              backgroundColor: colors.formatsLight.mindmap,
              borderRadius: 16,
              padding: 16,
              gap: 8,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.formats.mindmap }}>
                Como fazer um mapa mental
              </Text>
              <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                1. Coloque o tema principal no centro{'\n'}
                              2. Adicione ramos com ideias relacionadas{'\n'}
                3. Use cores para conectar conceitos{'\n'}
                4. Seja breve: use palavras-chave
              </Text>
            </View>
          )}

          <Button
            title="Continuar"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            icon="→"
          />
        </View>
      </ScreenWrapper>
    </View>
  );
}
