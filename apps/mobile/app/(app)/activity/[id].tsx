import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../../lib/colors';
import { useActivityStore } from '../../../store/activity';
import { getActivityById } from '../../../lib/mock-data';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { LearningObjective } from '../../../components/activity/LearningObjective';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { formatLabels, formatIcons, formatDescriptions } from '../../../lib/colors';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { responses } = useActivityStore();
  const activity = getActivityById(id || '');
  const [showFullRubric, setShowFullRubric] = useState(false);

  if (!activity) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Atividade" showBack />
        <EmptyState
          icon="🔍"
          title="Atividade não encontrada"
          message="Essa atividade pode ter sido removida ou o link está incorreto."
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const studentResponse = responses.find(
    (r) => r.activityId === activity.id && r.status === 'submitted'
  );
  const dueDate = new Date(activity.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const formatColors: Record<string, string> = {
    text: colors.formats.text,
    audio: colors.formats.audio,
    video: colors.formats.video,
    drawing: colors.formats.drawing,
    mindmap: colors.formats.mindmap,
    presentation: colors.formats.presentation,
    quiz: colors.formats.quiz,
    podcast: colors.formats.podcast,
    oral: colors.formats.oral,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: formatColors[activity.allowedFormats[0]], textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {activity.subject}
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.5, lineHeight: 32 }}>
              {activity.title}
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.tertiary }}>
              {activity.teacherName} · Criada em {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            gap: 12,
          }}>
            <View style={{
              flex: 1,
              backgroundColor: daysUntilDue <= 2 ? colors.errorLight : colors.successLight,
              borderRadius: 14,
              padding: 14,
              gap: 4,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: daysUntilDue <= 2 ? colors.error : colors.success, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Prazo
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
                {dueDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </Text>
              <Text style={{ fontSize: 13, color: daysUntilDue <= 2 ? colors.error : colors.text.secondary }}>
                {daysUntilDue <= 0 ? 'Prazo encerrado' : daysUntilDue === 1 ? 'Último dia!' : `${daysUntilDue} dias restantes`}
              </Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: studentResponse ? colors.successLight : colors.surfaceAlt,
              borderRadius: 14,
              padding: 14,
              gap: 4,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: studentResponse ? colors.success : colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Status
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
                {studentResponse ? 'Enviada' : 'Pendente'}
              </Text>
              <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                {studentResponse
                  ? `Respondida em ${new Date(studentResponse.submittedAt).toLocaleDateString('pt-BR')}`
                  : 'Aguardando resposta'}
              </Text>
            </View>
          </View>

          <LearningObjective objective={activity.learningObjective} />

          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
              📖 Descrição
            </Text>
            <Text style={{ fontSize: 15, color: colors.text.secondary, lineHeight: 24 }}>
              {activity.description}
            </Text>
          </View>

          {activity.instructions && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
                📌 Instruções
              </Text>
              <Card variant="colored" color={colors.formats.text} colorLight={colors.formatsLight.text}>
                <Text style={{ fontSize: 15, color: colors.text.secondary, lineHeight: 22 }}>
                  {activity.instructions}
                </Text>
              </Card>
            </View>
          )}

          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
              🎯 Formatos disponíveis
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary, marginBottom: 4 }}>
              Escolha o formato que mais combina com você para responder
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {activity.allowedFormats.map((format) => (
                <Chip
                  key={format}
                  label={`${formatIcons[format]} ${formatLabels[format]}`}
                  color={formatColors[format]}
                  lightColor={colors.formatsLight[format]}
                  size="md"
                />
              ))}
            </View>
          </View>

          {activity.rubric && activity.rubric.length > 0 && (
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowFullRubric(!showFullRubric)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
                  📋 Critérios de avaliação
                </Text>
                <Text style={{ fontSize: 14, color: colors.primary }}>
                  {showFullRubric ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: colors.text.tertiary }}>
                Você será avaliado em {activity.rubric.length} critérios
              </Text>
              {showFullRubric && (
                <View style={{ gap: 10 }}>
                  {activity.rubric.map((item, index) => (
                    <Card key={index} variant="outlined" color={colors.border}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                            {item.criterion}
                          </Text>
                          <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                            {item.description}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
                          Peso {item.weight}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ marginTop: 8, gap: 12 }}>
            {studentResponse ? (
              <>
                <Button
                  title="Ver minha resposta"
                  onPress={() => {}}
                  variant="outline"
                  fullWidth
                />
                <Button
                  title="Responder novamente"
                  onPress={() => router.push(`/(app)/activity/respond/${activity.id}`)}
                  variant="primary"
                  fullWidth
                />
              </>
            ) : (
              <Button
                title="Começar a responder"
                onPress={() => router.push(`/(app)/activity/respond/${activity.id}`)}
                variant="primary"
                size="lg"
                fullWidth
                icon="🚀"
              />
            )}
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}
