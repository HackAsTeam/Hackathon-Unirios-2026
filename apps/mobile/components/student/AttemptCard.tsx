import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { AttemptStatusBadge } from './AttemptStatusBadge';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';
import type { AttemptSummary } from '../../types/attempt';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function AttemptCard({
  attempt,
  onPress,
}: {
  attempt: AttemptSummary;
  onPress: () => void;
}) {
  const c = useColors();
  const scale = useScale();

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      accessibilityLabel={`${attempt.examTitle ?? 'Atividade'}, ${attempt.classroomName ?? ''}, status: ${attempt.status}`}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: scale(15), fontWeight: '700', color: c.text.primary, marginBottom: 4 }}>
            {attempt.examTitle ?? 'Atividade'}
          </Text>
          <Text style={{ fontSize: scale(13), color: c.text.secondary, marginBottom: 4 }}>
            {attempt.classroomName ?? ''}
          </Text>
          <Text style={{ fontSize: scale(12), color: c.text.tertiary }}>
            {attempt.submittedAt
              ? `Enviado em ${formatDate(attempt.submittedAt)}`
              : `Iniciado em ${formatDate(attempt.startedAt)}`}
          </Text>
        </View>
        <AttemptStatusBadge status={attempt.status} score={attempt.score} />
      </View>
    </Card>
  );
}
