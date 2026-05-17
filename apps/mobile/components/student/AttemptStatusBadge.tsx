import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';
import type { AttemptStatus } from '../../types/attempt';

const badgeConfig: Record<string, { label: string; color: string; bg: string }> = {
  null: { label: 'Pendente', color: colors.text.tertiary, bg: colors.borderLight },
  InProgress: { label: 'Em andamento', color: '#d97706', bg: '#fef3c7' },
  Submitted: { label: 'Enviado ✓', color: colors.info, bg: colors.infoLight },
  Graded: { label: '', color: colors.primary, bg: colors.successLight },
};

export function AttemptStatusBadge({
  status,
  score,
}: {
  status: AttemptStatus | null;
  score?: number | null;
}) {
  const key = status ?? 'null';
  const c = badgeConfig[key];
  const label = status === 'Graded' ? `★ ${score ?? '—'}` : c.label;

  return (
    <View
      style={{
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: c.bg,
        alignSelf: 'flex-start',
      }}
      accessibilityLabel={`Status: ${label}`}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: c.color }}>{label}</Text>
    </View>
  );
}
