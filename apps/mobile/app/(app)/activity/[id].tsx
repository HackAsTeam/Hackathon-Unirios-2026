import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth';
import { useAccessibilityStore } from '../../../store/acessibility';
import { apiFetch } from '../../../lib/api';
import { colors, formatLabels, formatDescriptions, formatMotivations } from '../../../lib/colors';
import { AccessibilityPanel } from '../../../components/accessibility/AccessibilityPanel';
import { AttemptStatusBadge } from '../../../components/student/AttemptStatusBadge';
import type { ExamDetail } from '../../../types/classroom';
import type { ResponseFormat } from '../../../types/activity';
import type { AttemptSummary } from '../../../types/attempt';

type AvailableFormat = 'text' | 'audio' | 'oral';
const AVAILABLE_FORMATS: AvailableFormat[] = ['text', 'audio', 'oral'];

const FORMAT_ICONS: Record<ResponseFormat, keyof typeof Ionicons.glyphMap> = {
  text: 'document-text-outline',
  audio: 'mic-outline',
  video: 'videocam-outline',
  drawing: 'brush-outline',
  mindmap: 'git-network-outline',
  presentation: 'easel-outline',
  quiz: 'help-circle-outline',
  podcast: 'radio-outline',
  oral: 'chatbubble-ellipses-outline',
};

export default function ActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { highContrast, reducedMotion, defaultResponseFormat } = useAccessibilityStore();
  const [showFormats, setShowFormats] = useState(false);

  const { data: exam, isLoading, isError } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => apiFetch<ExamDetail>(`/exams/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  const { data: attemptList, isLoading: attemptLoading } = useQuery<AttemptSummary[]>({
    queryKey: ['attempt-status', id],
    queryFn: () => apiFetch<AttemptSummary[]>(`/attempts?examId=${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  const attempt = attemptList?.[0] ?? null;
  const hasAttempt = attempt !== null;
  const isAudioFormat = defaultResponseFormat === 'audio';

  const bg = highContrast ? '#000' : colors.background;
  const textPrimary = highContrast ? '#fff' : colors.text.primary;
  const textSecondary = highContrast ? '#aaa' : colors.text.secondary;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !exam) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>😕</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, textAlign: 'center' }}>
          Atividade não encontrada
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderCTA() {
    if (attemptLoading) {
      return (
        <ActivityIndicator size="small" color={colors.primary} />
      );
    }

    if (!hasAttempt || attempt?.status === undefined) {
      return (
        <TouchableOpacity
          onPress={() => setShowFormats(true)}
          activeOpacity={0.85}
          accessibilityLabel="Iniciar Atividade"
          accessibilityRole="button"
          style={{
            backgroundColor: colors.primary,
            borderRadius: 18,
            paddingVertical: 18,
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.2 }}>
            Iniciar Atividade
          </Text>
        </TouchableOpacity>
      );
    }

    if (attempt.status === 'InProgress') {
      return (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 13, color: textSecondary, textAlign: 'center' }}>
            {attempt.answeredCount} de {attempt.totalQuestions} questões respondidas
          </Text>
          <TouchableOpacity
            onPress={() => setShowFormats(true)}
            activeOpacity={0.85}
            accessibilityLabel="Continuar atividade"
            accessibilityRole="button"
            style={{
              backgroundColor: colors.primary,
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ gap: 12 }}>
        <View style={{ alignItems: 'center' }}>
          <AttemptStatusBadge status={attempt.status} score={attempt.score} />
        </View>
        {attempt.status === 'Submitted' && (
          <Text style={{ fontSize: 13, color: textSecondary, textAlign: 'center' }}>
            Aguardando avaliação do professor
          </Text>
        )}
        <TouchableOpacity
          onPress={() => router.push(`/attempt/${attempt.id}`)}
          activeOpacity={0.85}
          accessibilityLabel={attempt.status === 'Graded' ? 'Ver resultado' : 'Ver detalhes'}
          accessibilityRole="button"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.primary,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.primary }}>
            {attempt.status === 'Graded' ? 'Ver resultado' : 'Ver detalhes'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(50).duration(400)}>
          <View style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.primaryLight + '30',
          }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              Atividade
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary, letterSpacing: -0.5, marginBottom: 8 }}>
              {exam.title}
            </Text>
            {exam.description && (
              <Text style={{ fontSize: 15, color: textSecondary, lineHeight: 22 }}>
                {exam.description}
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <Ionicons name="help-circle-outline" size={16} color={colors.text.tertiary} />
              <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                {exam.questions.length} pergunta{exam.questions.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </Animated.View>

        {exam.questions.length > 0 && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(150).duration(400)}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary, marginBottom: 12 }}>
              Perguntas
            </Text>
            <View style={{ gap: 10 }}>
              {exam.questions.map((q, i) => (
                <View
                  key={q.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: 4 }}>
                    Pergunta {i + 1}
                  </Text>
                  <Text style={{ fontSize: 15, color: textPrimary, lineHeight: 22 }}>
                    {q.text}
                  </Text>
                  {isAudioFormat && (
                    <TouchableOpacity
                      disabled
                      accessibilityLabel="Leitura em voz alta — em breve"
                      accessibilityHint="Este recurso estará disponível em breve"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.borderLight,
                        opacity: 0.5,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Ionicons name="play-circle-outline" size={18} color={colors.text.tertiary} />
                      <Text style={{ fontSize: 13, color: colors.text.tertiary }}>Ouvir questão</Text>
                    </TouchableOpacity>
                  )}
                  {q.options.length > 0 && (
                    <View style={{ marginTop: 4, gap: 6 }}>
                      {q.options.map((opt) => (
                        <View
                          key={opt.id}
                          style={{
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: 10,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: colors.borderLight,
                          }}
                        >
                          <Text style={{ fontSize: 14, color: textSecondary }}>{opt.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        backgroundColor: bg,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
      }}>
        {renderCTA()}
      </View>

      <FormatModal
        visible={showFormats}
        defaultFormat={defaultResponseFormat as AvailableFormat}
        onClose={() => setShowFormats(false)}
        onSelect={(fmt) => {
          setShowFormats(false);
          router.push(`/respond/${id}/${fmt}`);
        }}
        reducedMotion={reducedMotion}
        highContrast={highContrast}
      />

      <AccessibilityPanel />
    </View>
  );
}

function FormatModal({
  visible,
  defaultFormat,
  onClose,
  onSelect,
  reducedMotion,
  highContrast,
}: {
  visible: boolean;
  defaultFormat: AvailableFormat;
  onClose: () => void;
  onSelect: (format: AvailableFormat) => void;
  reducedMotion: boolean;
  highContrast: boolean;
}) {
  const bg = highContrast ? '#000' : colors.surface;
  const textPrimary = highContrast ? '#fff' : colors.text.primary;
  const textSecondary = highContrast ? '#aaa' : colors.text.secondary;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <View style={{
            backgroundColor: bg,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: Platform.OS === 'ios' ? 44 : 28,
            gap: 16,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary, letterSpacing: -0.3 }}>
              Como você quer responder?
            </Text>
            <Text style={{ fontSize: 14, color: textSecondary, marginTop: -8, lineHeight: 20 }}>
              Escolha o formato que melhor combina com você.
            </Text>
            {AVAILABLE_FORMATS.map((fmt, i) => (
              <FormatCard
                key={fmt}
                format={fmt}
                index={i}
                isDefault={fmt === defaultFormat}
                onSelect={onSelect}
                reducedMotion={reducedMotion}
                highContrast={highContrast}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FormatCard({
  format,
  index,
  isDefault,
  onSelect,
  reducedMotion,
  highContrast,
}: {
  format: AvailableFormat;
  index: number;
  isDefault: boolean;
  onSelect: (f: AvailableFormat) => void;
  reducedMotion: boolean;
  highContrast: boolean;
}) {
  const color = colors.formats[format];
  const lightColor = highContrast ? '#111' : colors.formatsLight[format];
  const textPrimary = highContrast ? '#fff' : colors.text.primary;
  const scale = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    if (!reducedMotion) {
      scale.value = withSpring(0.96, { damping: 15 }, () => {
        scale.value = withSpring(1);
      });
    }
    onSelect(format);
  }

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.delay(index * 80).duration(350).springify()}
      style={animated}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        accessibilityLabel={`${formatLabels[format]}: ${formatDescriptions[format]}${isDefault ? ' (preferência padrão)' : ''}`}
        accessibilityRole="button"
        style={{
          backgroundColor: lightColor,
          borderRadius: 20,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          borderWidth: isDefault ? 2.5 : 1.5,
          borderColor: isDefault ? color : color + '35',
        }}
      >
        <View style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: color + '20',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name={FORMAT_ICONS[format]} size={26} color={color} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: textPrimary, letterSpacing: -0.2 }}>
              {formatLabels[format]}
            </Text>
            {isDefault && (
              <View style={{ backgroundColor: color + '20', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color }}>Padrão</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 13, color, fontWeight: '500' }}>
            {formatMotivations[format]}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
}
