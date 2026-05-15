import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../lib/colors';
import { useActivityStore } from '../../../../store/activity';
import { getActivityById, MOCK_STUDENT } from '../../../../lib/mock-data';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/layout/ScreenWrapper';
import { LearningObjective } from '../../../../components/activity/LearningObjective';
import { Button } from '../../../../components/ui/Button';
import { SuccessState } from '../../../../components/ui/SuccessState';
import { formatLabels, formatIcons, formatDescriptions } from '../../../../lib/colors';

export default function SubmitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    currentResponseFormat,
    currentResponseContent,
    submitResponse,
    clearCurrentResponse,
  } = useActivityStore();
  const activity = getActivityById(id || '') || null;
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!id || !currentResponseFormat || !activity) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Enviar" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>😕</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary, textAlign: 'center' }}>
            Nada para enviar
          </Text>
          <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>
            Você precisa escolher um formato e produzir sua resposta primeiro.
          </Text>
          <Button title="Voltar" onPress={() => router.back()} variant="primary" />
        </View>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SuccessState
          title="Resposta enviada! 🎉"
          message={`Sua resposta em ${formatLabels[currentResponseFormat].toLowerCase()} foi enviada com sucesso. ${activity.teacherName} vai adorar ver como você aprendeu!`}
          actionLabel="Ver outras atividades"
          onAction={() => {
            clearCurrentResponse();
            router.replace('/(app)/(tabs)');
          }}
          secondaryLabel="Voltar para a atividade"
          onSecondary={() => {
            clearCurrentResponse();
            router.replace(`/(app)/activity/${id}`);
          }}
        />
      </View>
    );
  }

  function handleSubmit() {
    setIsSubmitting(true);
    setTimeout(() => {
      submitResponse(activity!.id, MOCK_STUDENT.id, MOCK_STUDENT.name);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  }

  const formatColor = colors.formats[currentResponseFormat];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Enviar resposta" subtitle="Revise antes de enviar" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          <LearningObjective objective={activity!.learningObjective} compact />

          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.borderLight,
            gap: 16,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
              📋 Resumo da resposta
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: formatColor + '18',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 22 }}>{formatIcons[currentResponseFormat]}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                  {formatLabels[currentResponseFormat]}
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                  {formatDescriptions[currentResponseFormat]}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.divider }} />

            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Atividade
              </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                {activity!.title}
              </Text>
              <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                {activity!.subject} · {activity!.teacherName}
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 16,
            padding: 16,
            gap: 10,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              Antes de enviar...
            </Text>
            <View style={{ gap: 6 }}>
              {[
                'Você revisou sua resposta?',
                'Tem certeza que quer enviar este formato?',
                'Após enviar, você poderá responder novamente se precisar.',
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 14, color: colors.primary }}>✓</Text>
                  <Text style={{ fontSize: 14, color: colors.text.secondary, flex: 1 }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Button
              title={isSubmitting ? 'Enviando...' : 'Enviar resposta'}
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              fullWidth
              icon={isSubmitting ? undefined : '🚀'}
              loading={isSubmitting}
            />
            <Button
              title="Voltar e editar"
              onPress={() => router.back()}
              variant="ghost"
              fullWidth
            />
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}
