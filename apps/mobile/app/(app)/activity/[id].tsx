import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth';
import { useAccessibilityStore } from '../../../store/acessibility';
import { useVoiceCommandStore } from '../../../store/voiceCommand';
import { useScreenContext } from '../../../hooks/useScreenContext';
import { speak } from '../../../lib/tts';
import { apiFetch } from '../../../lib/api';
import { colors, formatLabels, formatDescriptions, formatMotivations } from '../../../lib/colors';
import { useColors } from '../../../hooks/useColors';
import { useScale } from '../../../hooks/useScale';
import { AccessibilityPanel } from '../../../components/accessibility/AccessibilityPanel';
import { AttemptStatusBadge } from '../../../components/student/AttemptStatusBadge';
import { VoiceAssistantOverlay } from '../../../components/voice/VoiceAssistantOverlay';
import type { ExamDetail } from '../../../types/classroom';
import type { ResponseFormat } from '../../../types/activity';
import type { AttemptSummary } from '../../../types/attempt';

const diloImage = require('../../../assets/dillo-assistant-image.png');

type AvailableFormat = 'text' | 'audio' | 'libras';
const AVAILABLE_FORMATS: AvailableFormat[] = ['text', 'audio', 'libras'];

const FORMAT_ICONS: Record<AvailableFormat, keyof typeof Ionicons.glyphMap> = {
  text: 'document-text-outline',
  audio: 'mic-outline',
  libras: 'hand-left-outline',
};

export default function ActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useScreenContext({ screen: 'student-activity', activityId: id, role: 'student' });
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { reducedMotion, defaultResponseFormat } = useAccessibilityStore();
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);
  const c = useColors();
  const scale = useScale();
  const [showFormats, setShowFormats] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!lastCommand || !isFocused) return;

    if (lastCommand.command === 'START_ACTIVITY') {
      setShowFormats(true);
    }

    if (lastCommand.command === 'READ_ALOUD' && exam) {
      const parts: string[] = [`Atividade: ${exam.title}.`];
      if (exam.description) parts.push(exam.description);
      exam.questions.forEach((q, i) => {
        parts.push(`Questão ${i + 1}: ${q.text}`);
        if (q.options.length > 0) {
          const letters = ['A', 'B', 'C', 'D'];
          const sorted = [...q.options].sort((a, b) => a.orderIndex - b.orderIndex);
          sorted.forEach((opt, j) => parts.push(`${letters[j] ?? j + 1}: ${opt.text}`));
        }
      });
      speak(parts.join('. '));
    }

    if (lastCommand.command === 'CHOOSE_RESPONSE_FORMAT') {
      const fmt = lastCommand.payload?.format as string | undefined;
      if (!fmt || fmt === 'libras') return;
      if (fmt === 'text' || fmt === 'audio') {
        useAccessibilityStore.getState().setDefaultResponseFormat(fmt as 'text' | 'audio');
      }
      if (showFormats) {
        setShowFormats(false);
        router.push(`/respond/${id}/${fmt}`);
      }
    }
  }, [lastCommand, exam, showFormats]);

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (isError || !exam) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Ionicons name="alert-circle-outline" size={56} color={c.error} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, textAlign: 'center' }}>
          Atividade não encontrada
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ color: c.primary, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderCTA() {
    if (attemptLoading) {
      return <ActivityIndicator size="small" color={c.primary} />;
    }

    if (!hasAttempt || attempt?.status === undefined) {
      return (
        <TouchableOpacity
          onPress={() => setShowFormats(true)}
          activeOpacity={0.85}
          accessibilityLabel="Iniciar Atividade"
          accessibilityRole="button"
          style={{
            backgroundColor: c.primary,
            borderRadius: 18,
            paddingVertical: 18,
            alignItems: 'center',
            shadowColor: c.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: scale(17), fontWeight: '700', color: '#fff', letterSpacing: -0.2 }}>
            Iniciar Atividade
          </Text>
        </TouchableOpacity>
      );
    }

    if (attempt.status === 'InProgress') {
      return (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: scale(13), color: c.text.secondary, textAlign: 'center' }}>
            {attempt.answeredCount} de {attempt.totalQuestions} questões respondidas
          </Text>
          <TouchableOpacity
            onPress={() => setShowFormats(true)}
            activeOpacity={0.85}
            accessibilityLabel="Continuar atividade"
            accessibilityRole="button"
            style={{
              backgroundColor: c.primary,
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: scale(17), fontWeight: '700', color: '#fff' }}>
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
          <Text style={{ fontSize: scale(13), color: c.text.secondary, textAlign: 'center' }}>
            Aguardando avaliação do professor
          </Text>
        )}
        <TouchableOpacity
          onPress={() => router.push(`/attempt/${attempt.id}`)}
          activeOpacity={0.85}
          accessibilityLabel={attempt.status === 'Graded' ? 'Ver resultado' : 'Ver detalhes'}
          accessibilityRole="button"
          style={{
            backgroundColor: c.surfaceAlt,
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: c.primary,
          }}
        >
          <Text style={{ fontSize: scale(17), fontWeight: '700', color: c.primary }}>
            {attempt.status === 'Graded' ? 'Ver resultado' : 'Ver detalhes'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={20} color={c.primary} />
          <Text style={{ fontSize: scale(15), color: c.primary, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(50).duration(400)}>
          <View style={{
            backgroundColor: c.surfaceAlt,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: c.primaryLight + '30',
          }}>
            <Text style={{ fontSize: scale(13), fontWeight: '600', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              Atividade
            </Text>
            <Text style={{ fontSize: scale(24), fontWeight: '800', color: c.text.primary, letterSpacing: -0.5, marginBottom: 8 }}>
              {exam.title}
            </Text>
            {exam.description && (
              <Text style={{ fontSize: scale(15), color: c.text.secondary, lineHeight: 22 }}>
                {exam.description}
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <Ionicons name="help-circle-outline" size={16} color={c.text.tertiary} />
              <Text style={{ fontSize: scale(13), color: c.text.tertiary }}>
                {exam.questions.length} pergunta{exam.questions.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </Animated.View>

        {exam.questions.length > 0 && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(150).duration(400)}>
            <Text style={{ fontSize: scale(16), fontWeight: '700', color: c.text.primary, marginBottom: 12 }}>
              Perguntas
            </Text>
            <View style={{ gap: 10 }}>
              {exam.questions.map((q, i) => (
                <View
                  key={q.id}
                  style={{
                    backgroundColor: c.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: c.borderLight,
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: scale(13), color: c.primary, fontWeight: '600', marginBottom: 4 }}>
                    Pergunta {i + 1}
                  </Text>
                  <Text style={{ fontSize: scale(15), color: c.text.primary, lineHeight: 22 }}>
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
                        borderColor: c.border,
                        backgroundColor: c.borderLight,
                        opacity: 0.5,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Ionicons name="play-circle-outline" size={18} color={c.text.tertiary} />
                      <Text style={{ fontSize: scale(13), color: c.text.tertiary }}>Ouvir questão</Text>
                    </TouchableOpacity>
                  )}
                  {q.options.length > 0 && (
                    <View style={{ marginTop: 4, gap: 6 }}>
                      {q.options.map((opt) => (
                        <View
                          key={opt.id}
                          style={{
                            backgroundColor: c.surfaceAlt,
                            borderRadius: 10,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: c.borderLight,
                          }}
                        >
                          <Text style={{ fontSize: scale(14), color: c.text.secondary }}>{opt.text}</Text>
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
        backgroundColor: c.background,
        borderTopWidth: 1,
        borderTopColor: c.borderLight,
      }}>
        {renderCTA()}
      </View>

      <FormatModal
        visible={showFormats}
        defaultFormat={defaultResponseFormat as AvailableFormat}
        onClose={() => setShowFormats(false)}
        onSelect={(fmt) => {
          if (fmt === 'libras') return;
          setShowFormats(false);
          router.push(`/respond/${id}/${fmt}`);
        }}
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
}: {
  visible: boolean;
  defaultFormat: AvailableFormat;
  onClose: () => void;
  onSelect: (format: AvailableFormat) => void;
}) {
  const c = useColors();
  const scale = useScale();
  const { reducedMotion } = useAccessibilityStore();
  const [voiceOverlayVisible, setVoiceOverlayVisible] = useState(false);

  useEffect(() => {
    if (visible) speak('Como você quer responder? Diga: texto ou áudio. Libras em breve.');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <View style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: Platform.OS === 'ios' ? 44 : 28,
            gap: 16,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
            </View>
            <Text style={{ fontSize: scale(22), fontWeight: '800', color: c.text.primary, letterSpacing: -0.3 }}>
              Como você quer responder?
            </Text>
            <Text style={{ fontSize: scale(14), color: c.text.secondary, marginTop: -8, lineHeight: 20 }}>
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
                disabled={fmt === 'libras'}
              />
            ))}
            <TouchableOpacity
              onPress={() => setVoiceOverlayVisible(true)}
              accessibilityLabel="Abrir Dilo por voz"
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 }}
            >
              <Image source={diloImage} style={{ width: 28, height: 28 }} />
              <Text style={{ color: c.text.secondary, fontSize: scale(13) }}>Responder com Dilo</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>

      <VoiceAssistantOverlay
        visible={voiceOverlayVisible}
        onClose={() => setVoiceOverlayVisible(false)}
      />
    </Modal>
  );
}

function FormatCard({
  format,
  index,
  isDefault,
  onSelect,
  reducedMotion,
  disabled,
}: {
  format: AvailableFormat;
  index: number;
  isDefault: boolean;
  onSelect: (f: AvailableFormat) => void;
  reducedMotion: boolean;
  disabled?: boolean;
}) {
  const c = useColors();
  const scale = useScale();
  const color = colors.formats[format];
  const lightColor = c.formatsLight[format];
  const animScale = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: animScale.value }],
  }));

  function handlePress() {
    if (disabled) {
      speak('Libras ainda não está disponível.');
      return;
    }
    if (!reducedMotion) {
      animScale.value = withSpring(0.96, { damping: 15 }, () => {
        animScale.value = withSpring(1);
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
        accessibilityLabel={`${formatLabels[format]}: ${formatDescriptions[format]}${isDefault ? ' (preferência padrão)' : ''}${disabled ? ' (em breve)' : ''}`}
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
          ...(disabled && { opacity: 0.55 }),
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
            <Text style={{ fontSize: scale(17), fontWeight: '700', color: c.text.primary, letterSpacing: -0.2 }}>
              {formatLabels[format]}
            </Text>
            {disabled ? (
              <View style={{ backgroundColor: c.text.tertiary + '20', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: scale(10), fontWeight: '700', color: c.text.tertiary }}>{`Em breve`}</Text>
              </View>
            ) : isDefault ? (
              <View style={{ backgroundColor: color + '20', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: scale(10), fontWeight: '700', color }}>{`Padrão`}</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontSize: scale(13), color, fontWeight: '500' }}>
            {formatMotivations[format]}
          </Text>
        </View>
        {!disabled && <Ionicons name="chevron-forward" size={18} color={color} />}
      </TouchableOpacity>
    </Animated.View>
  );
}
