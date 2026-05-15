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
import { ProgressBar } from '../../../../components/ui/ProgressBar';

const mockQuestions = [
  {
    id: 'q1',
    question: 'Qual é a primeira etapa do ciclo da água?',
    options: ['Condensação', 'Evaporação', 'Precipitação', 'Infiltração'],
    correct: 1,
  },
  {
    id: 'q2',
    question: 'O que acontece com o vapor de água na atmosfera?',
    options: ['Vira nuvem (condensação)', 'Desaparece', 'Vira gelo imediatamente', 'Volta para o mar'],
    correct: 0,
  },
  {
    id: 'q3',
    question: 'A água da chuva que se infiltra no solo forma:',
    options: ['Oceanos', 'Lençóis freáticos', 'Nuvens', 'Glaciares'],
    correct: 1,
  },
];

export default function QuizResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setResponseContent } = useActivityStore();
  const activity = getActivityById(id || '');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const question = mockQuestions[currentQuestion];
  const progress = (currentQuestion + (selectedOption !== null ? 1 : 0)) / mockQuestions.length;

  function handleSelectOption(index: number) {
    if (showResult) return;
    setSelectedOption(index);
  }

  function handleNext() {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const correctCount = newAnswers.filter(
        (a, i) => a === mockQuestions[i].correct
      ).length;
      setResponseContent({
        answers: newAnswers,
        totalQuestions: mockQuestions.length,
        correctCount,
      });
      setShowResult(true);
    }
  }

  if (showResult) {
    const correctCount = answers.filter((a, i) => a === mockQuestions[i].correct).length;
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Quiz" subtitle="❓ Resultado" showBack />
        <ScreenWrapper scroll paddingHorizontal={0}>
          <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 100 }}>
            <View style={{
              backgroundColor: colors.formatsLight.quiz,
              borderRadius: 20,
              padding: 32,
              alignItems: 'center',
              gap: 12,
            }}>
              <Text style={{ fontSize: 48 }}>
                {correctCount === mockQuestions.length ? '🎉' : correctCount >= 2 ? '👍' : '💪'}
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
                {correctCount} de {mockQuestions.length}
              </Text>
              <Text style={{ fontSize: 15, color: colors.text.secondary, textAlign: 'center' }}>
                {correctCount === mockQuestions.length
                  ? 'Perfeito! Você acertou todas!'
                  : correctCount >= 2
                  ? 'Muito bem! Você está no caminho certo!'
                  : 'Continue praticando! A próxima vez será ainda melhor.'}
              </Text>
            </View>
            <Button
              title="Continuar"
              onPress={() => router.push(`/(app)/activity/submit/${id}`)}
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Quiz" subtitle={`❓ Pergunta ${currentQuestion + 1} de ${mockQuestions.length}`} showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 100 }}>
          {activity && <LearningObjective objective={activity.learningObjective} compact />}

          <ProgressBar progress={progress} color={colors.formats.quiz} />

          <View style={{ gap: 16 }}>
            <Text style={{
              backgroundColor: colors.formatsLight.quiz,
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 4,
              fontSize: 12,
              fontWeight: '600',
              color: colors.formats.quiz,
              alignSelf: 'flex-start',
              overflow: 'hidden',
            }}>
              PERGUNTA {currentQuestion + 1} DE {mockQuestions.length}
            </Text>

            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, lineHeight: 28, letterSpacing: -0.3 }}>
              {question.question}
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectOption(index)}
                accessibilityLabel={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedOption === index }}
                style={{
                  backgroundColor: selectedOption === index ? colors.formatsLight.quiz : colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 2,
                  borderColor: selectedOption === index ? colors.formats.quiz : colors.borderLight,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: selectedOption === index ? colors.formats.quiz : colors.border,
                    backgroundColor: selectedOption === index ? colors.formats.quiz : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedOption === index && (
                    <Text style={{ fontSize: 14, color: '#fff' }}>✓</Text>
                  )}
                </View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: selectedOption === index ? '600' : '400',
                  color: colors.text.primary,
                  flex: 1,
                }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title={currentQuestion < mockQuestions.length - 1 ? 'Próxima' : 'Finalizar'}
            onPress={handleNext}
            variant="primary"
            size="lg"
            fullWidth
            disabled={selectedOption === null}
            icon={currentQuestion < mockQuestions.length - 1 ? '→' : '✓'}
          />
        </View>
      </ScreenWrapper>
    </View>
  );
}
