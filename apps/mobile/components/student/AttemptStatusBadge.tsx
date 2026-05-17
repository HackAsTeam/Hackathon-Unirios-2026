import { View, Text } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';
import type { AttemptStatus } from '../../types/attempt';

export function AttemptStatusBadge({
  status,
  score,
}: {
  status: AttemptStatus | null;
  score?: number | null;
}) {
  const c = useColors();
  const scale = useScale();

  const config: Record<string, { label: string; color: string; bg: string }> = {
    null: { label: 'Pendente', color: c.text.tertiary, bg: c.borderLight },
    InProgress: { label: 'Em andamento', color: c.warning, bg: c.warningLight },
    Submitted: { label: 'Enviado ✓', color: c.info, bg: c.infoLight },
    Graded: { label: '', color: c.primary, bg: c.successLight },
  };

  const key = status ?? 'null';
  const badge = config[key];
  const label = status === 'Graded' ? `★ ${score ?? '—'}` : badge.label;

  return (
    <View
      style={{
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: badge.bg,
        alignSelf: 'flex-start',
      }}
      accessibilityLabel={`Status: ${label}`}
    >
      <Text style={{ fontSize: scale(12), fontWeight: '600', color: badge.color }}>{label}</Text>
    </View>
  );
}
