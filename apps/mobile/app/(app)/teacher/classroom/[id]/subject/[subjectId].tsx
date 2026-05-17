import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';
import type { Exam } from '@/types/classroom';

export default function SubjectDetailScreen() {
  const { id, subjectId, name } = useLocalSearchParams<{
    id: string;
    subjectId: string;
    name: string;
  }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const c = useColors();
  const scale = useScale();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', subjectId],
    queryFn: () => apiFetch<Exam[]>(`/subjects/${subjectId}/activities`, { token: token! }),
    enabled: !!subjectId && !!token,
  });

  function openCreate() {
    router.push(`/teacher/new-activity?subjectId=${subjectId}&classroomId=${id}&name=${encodeURIComponent(name ?? '')}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View
        style={{
          paddingTop: 56,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: c.surface,
          borderBottomWidth: 1,
          borderBottomColor: c.borderLight,
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace(`/teacher/classroom/${id}`)}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={c.primary} />
          <Text style={{ fontSize: scale(15), color: c.primary, fontWeight: '500' }}>Matérias</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: scale(24), fontWeight: '700', color: c.text.primary }}>
          {decodeURIComponent(name ?? '')}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary }}>
              Atividades
            </Text>
            <TouchableOpacity
              onPress={openCreate}
              style={{
                backgroundColor: c.surfaceAlt,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: c.primaryLight,
              }}
            >
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.primary }}>
                + Nova Atividade
              </Text>
            </TouchableOpacity>
          </View>

          {(!activities || activities.length === 0) && (
            <View
              style={{
                backgroundColor: c.surfaceAlt,
                borderRadius: 16,
                padding: 28,
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
              }}
            >
              <Ionicons name="document-text-outline" size={48} color={c.text.tertiary} />
              <Text
                style={{
                  fontSize: scale(16),
                  fontWeight: '600',
                  color: c.text.primary,
                  marginTop: 4,
                }}
              >
                Nenhuma atividade ainda
              </Text>
              <Text style={{ fontSize: scale(14), color: c.text.secondary, textAlign: 'center' }}>
                Crie a primeira atividade para os alunos desta matéria.
              </Text>
              <TouchableOpacity
                onPress={openCreate}
                style={{
                  marginTop: 8,
                  backgroundColor: c.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                }}
              >
                <Text style={{ fontSize: scale(15), fontWeight: '600', color: c.text.inverse }}>
                  Criar Atividade
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activities?.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => router.push(`/teacher/activity/${a.id}?subjectId=${subjectId}&classroomId=${id}&name=${encodeURIComponent(name ?? '')}`)}
              style={{
                backgroundColor: c.surface,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: c.borderLight,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: c.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="document-text-outline" size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary }}>
                  {a.title}
                </Text>
                {a.description && (
                  <Text
                    style={{ fontSize: scale(13), color: c.text.secondary, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {a.description}
                  </Text>
                )}
                <Text style={{ fontSize: scale(12), color: c.text.tertiary, marginTop: 4 }}>
                  {a.questionCount} questão{a.questionCount !== 1 ? 'es' : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
