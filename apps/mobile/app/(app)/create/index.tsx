import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../lib/colors';
import { useActivityStore } from '../../../store/activity';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { Card } from '../../../components/ui/Card';
import { SuccessState } from '../../../components/ui/SuccessState';
import { ResponseFormat } from '../../../types/activity';
import { formatLabels, formatIcons, formatDescriptions } from '../../../lib/colors';

const ALL_FORMATS: ResponseFormat[] = [
  'text', 'audio', 'video', 'drawing', 'mindmap',
  'presentation', 'quiz', 'podcast', 'oral',
];

export default function CreateActivityScreen() {
  const router = useRouter();
  const { activities, setActivities } = useActivityStore();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<ResponseFormat[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [created, setCreated] = useState(false);

  function toggleFormat(format: ResponseFormat) {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  }

  function handleCreate() {
    const newActivity = {
      id: `act-${Date.now()}`,
      title,
      learningObjective,
      description,
      teacherId: 'teacher-1',
      teacherName: 'Profa. Ana Clara',
      subject,
      allowedFormats: selectedFormats,
      dueDate: dueDate || '2026-06-30',
      status: 'open' as const,
      createdAt: new Date().toISOString(),
      instructions: instructions || undefined,
      rubric: [
        { criterion: 'Compreensão do conceito', description: 'Demonstra entendimento do conteúdo', weight: 3 },
        { criterion: 'Clareza na comunicação', description: 'Transmite a ideia de forma compreensível', weight: 3 },
        { criterion: 'Criatividade', description: 'Aborda o tema de forma original', weight: 2 },
        { criterion: 'Relação com o objetivo', description: 'Resposta alinhada ao objetivo de aprendizagem', weight: 2 },
      ],
    };

    setActivities([newActivity, ...activities]);
    setCreated(true);
  }

  if (created) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SuccessState
          title="Atividade criada!"
          message="Seus alunos já podem ver e escolher como responder. Acompanhe as respostas na página inicial."
          actionLabel="Ver atividade"
          onAction={() => router.replace('/(app)/(tabs)')}
          secondaryLabel="Criar outra atividade"
          onSecondary={() => {
            setCreated(false);
            setStep(1);
            setTitle('');
            setSubject('');
            setLearningObjective('');
            setDescription('');
            setInstructions('');
            setSelectedFormats([]);
            setDueDate('');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Criar Atividade" subtitle="👩‍🏫 Defina o objetivo e os formatos" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 100 }}>
          <View style={{
            flexDirection: 'row',
            gap: 4,
            alignItems: 'center',
          }}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: step >= s ? colors.primary : colors.borderLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>{s}</Text>
                </View>
                {s < 3 && (
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: step > s ? colors.primary : colors.borderLight,
                    }}
                  />
                )}
              </View>
            ))}
          </View>

          {step === 1 && (
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
                📋 Informações básicas
              </Text>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  Título da atividade
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex: Ciclo da Água na Natureza"
                  placeholderTextColor={colors.text.tertiary}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text.primary,
                    borderWidth: 1.5,
                    borderColor: colors.borderLight,
                  }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  Matéria / Disciplina
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Ex: Ciências, Matemática..."
                  placeholderTextColor={colors.text.tertiary}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text.primary,
                    borderWidth: 1.5,
                    borderColor: colors.borderLight,
                  }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  🎯 Objetivo de Aprendizagem
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary, marginBottom: 2 }}>
                  O que o aluno deve ser capaz de demonstrar ao final?
                </Text>
                <TextInput
                  value={learningObjective}
                  onChangeText={setLearningObjective}
                  placeholder="Ex: Compreender e explicar as etapas do ciclo da água..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  textAlignVertical="top"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text.primary,
                    lineHeight: 22,
                    minHeight: 80,
                    borderWidth: 1.5,
                    borderColor: colors.borderLight,
                  }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  Descrição
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descreva a atividade de forma acolhedora..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  textAlignVertical="top"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text.primary,
                    lineHeight: 22,
                    minHeight: 80,
                    borderWidth: 1.5,
                    borderColor: colors.borderLight,
                  }}
                />
              </View>

              <Button
                title="Próximo: Formatos"
                onPress={() => setStep(2)}
                variant="primary"
                size="lg"
                fullWidth
                disabled={!title || !subject || !learningObjective}
              />
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
                🎨 Formatos de Resposta
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 20 }}>
                Selecione os formatos que os alunos poderão escolher para demonstrar o aprendizado. 
                Quanto mais formatos, mais inclusiva a atividade.
              </Text>

              <View style={{ gap: 8 }}>
                {ALL_FORMATS.map((format) => {
                  const isSelected = selectedFormats.includes(format);
                  const formatColor = colors.formats[format];
                  const lightColor = colors.formatsLight[format];

                  return (
                    <TouchableOpacity
                      key={format}
                      onPress={() => toggleFormat(format)}
                      accessibilityLabel={`${formatLabels[format]}: ${formatDescriptions[format]}`}
                      style={{
                        backgroundColor: isSelected ? lightColor : colors.surface,
                        borderRadius: 16,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        borderWidth: 1.5,
                        borderColor: isSelected ? formatColor : colors.borderLight,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          backgroundColor: isSelected ? formatColor + '20' : colors.surfaceAlt,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>{formatIcons[format]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                          {formatLabels[format]}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                          {formatDescriptions[format]}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: isSelected ? formatColor : 'transparent',
                          borderWidth: 2,
                          borderColor: isSelected ? formatColor : colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ marginTop: 8, gap: 8 }}>
                <Button
                  title="Próximo: Detalhes"
                  onPress={() => setStep(3)}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={selectedFormats.length === 0}
                />
                <Button
                  title="Voltar"
                  onPress={() => setStep(1)}
                  variant="ghost"
                  fullWidth
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
                📌 Detalhes finais
              </Text>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  Instruções para os alunos (opcional)
                </Text>
                <TextInput
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder="Dê dicas de como abordar a atividade..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  textAlignVertical="top"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text.primary,
                    lineHeight: 22,
                    minHeight: 80,
                    borderWidth: 1.5,
                    borderColor: colors.borderLight,
                  }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  Data de entrega
                </Text>
                <TextInput
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="AAAA-MM-DD (ex: 2026-06-15)"
                  placeholderTextColor={colors.text.tertiary}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text.primary,
                    borderWidth: 1.5,
                    borderColor: colors.borderLight,
                  }}
                />
              </View>

              <Card variant="colored" colorLight={colors.surfaceAlt}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>
                  📋 Resumo da atividade
                </Text>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                    <Text style={{ fontWeight: '600' }}>Título:</Text> {title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                    <Text style={{ fontWeight: '600' }}>Matéria:</Text> {subject}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                    <Text style={{ fontWeight: '600' }}>Formatos:</Text> {selectedFormats.map((f) => formatLabels[f]).join(', ')}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                    <Text style={{ fontWeight: '600' }}>Entrega:</Text> {dueDate || 'A definir'}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text.secondary }} numberOfLines={2}>
                    <Text style={{ fontWeight: '600' }}>Objetivo:</Text> {learningObjective}
                  </Text>
                </View>
              </Card>

              <View style={{ marginTop: 8, gap: 8 }}>
                <Button
                  title="Criar atividade"
                  onPress={handleCreate}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon="🚀"
                />
                <Button
                  title="Voltar"
                  onPress={() => setStep(2)}
                  variant="ghost"
                  fullWidth
                />
              </View>
            </View>
          )}
        </View>
      </ScreenWrapper>
    </View>
  );
}
