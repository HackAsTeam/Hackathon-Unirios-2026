import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../lib/colors';
import { useActivityStore } from '../../../../store/activity';
import { getActivityById } from '../../../../lib/mock-data';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/layout/ScreenWrapper';
import { LearningObjective } from '../../../../components/activity/LearningObjective';
import { Button } from '../../../../components/ui/Button';
import { Chip } from '../../../../components/ui/Chip';

interface Slide {
  id: string;
  title: string;
  content: string;
}

export default function PresentationResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', title: 'Título da apresentação', content: 'Seu nome e informação principal' },
    { id: '2', title: 'Ideia principal', content: 'O que você aprendeu' },
    { id: '3', title: 'Detalhes', content: 'Aprofunde o conteúdo' },
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  function handleContinue() {
    setResponseContent({ slides, totalSlides: slides.length });
    router.push(`/(app)/activity/submit/${id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Apresentação" subtitle="📽️ Crie seus slides" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {slides.map((slide, index) => (
              <Chip
                key={slide.id}
                label={`Slide ${index + 1}`}
                color={colors.formats.presentation}
                lightColor={colors.formatsLight.presentation}
                selected={currentSlide === index}
                onPress={() => setCurrentSlide(index)}
              />
            ))}
            <Chip
              label="+ Novo"
              color={colors.formats.presentation}
              lightColor={colors.formatsLight.presentation}
              onPress={() => {
                setSlides([...slides, { id: String(slides.length + 1), title: 'Novo slide', content: '' }]);
                setCurrentSlide(slides.length);
              }}
            />
          </ScrollView>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              minHeight: 260,
              borderWidth: 1.5,
              borderColor: colors.formats.presentation + '20',
              gap: 16,
            }}
          >
            <TextInput
              value={slides[currentSlide]?.title || ''}
              onChangeText={(text) => {
                const updated = [...slides];
                updated[currentSlide] = { ...updated[currentSlide], title: text };
                setSlides(updated);
              }}
              placeholder="Título do slide"
              placeholderTextColor={colors.text.tertiary}
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.formats.presentation,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
                paddingBottom: 8,
              }}
            />
            <TextInput
              value={slides[currentSlide]?.content || ''}
              onChangeText={(text) => {
                const updated = [...slides];
                updated[currentSlide] = { ...updated[currentSlide], content: text };
                setSlides(updated);
              }}
              placeholder="Conteúdo do slide..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              textAlignVertical="top"
              style={{
                fontSize: 16,
                color: colors.text.primary,
                lineHeight: 24,
                minHeight: 160,
                flex: 1,
              }}
            />
          </View>

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
