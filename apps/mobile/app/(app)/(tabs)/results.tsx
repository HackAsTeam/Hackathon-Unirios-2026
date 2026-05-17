import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMyAttempts } from '../../../hooks/useMyAttempts';
import { AttemptCard } from '../../../components/student/AttemptCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Header } from '../../../components/ui/Header';
import { useColors } from '../../../hooks/useColors';
import { useScale } from '../../../hooks/useScale';
import { useScreenContext } from '../../../hooks/useScreenContext';
import type { AttemptSummary } from '../../../types/attempt';

function Section({ title, items }: { title: string; items: AttemptSummary[] }) {
  const router = useRouter();
  const c = useColors();
  const scale = useScale();
  if (items.length === 0) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: scale(14), fontWeight: '700', color: c.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        {title}
      </Text>
      <View style={{ gap: 10 }}>
        {items.map((a) => (
          <AttemptCard
            key={a.id}
            attempt={a}
            onPress={() => router.push(`/attempt/${a.id}`)}
          />
        ))}
      </View>
    </View>
  );
}

export default function ResultsScreen() {
  useScreenContext({ screen: 'results', role: 'student' });
  const { data: attempts, isLoading, isError, refetch } = useMyAttempts();
  const c = useColors();
  const scale = useScale();

  const graded = attempts?.filter((a) => a.status === 'Graded') ?? [];
  const submitted = attempts?.filter((a) => a.status === 'Submitted') ?? [];
  const inProgress = attempts?.filter((a) => a.status === 'InProgress') ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Resultados" subtitle="Suas tentativas" />

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      )}

      {isError && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: scale(16), color: c.text.secondary, textAlign: 'center', marginBottom: 16 }}>
            Não foi possível carregar seus resultados
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ backgroundColor: c.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && attempts?.length === 0 && (
        <EmptyState
          iconName="document-text-outline"
          title="Nenhum resultado ainda"
          message="Você ainda não respondeu nenhuma atividade"
        />
      )}

      {!isLoading && !isError && attempts && attempts.length > 0 && (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Section title="Avaliados" items={graded} />
          <Section title="Enviados" items={submitted} />
          <Section title="Em andamento" items={inProgress} />
        </ScrollView>
      )}
    </View>
  );
}
