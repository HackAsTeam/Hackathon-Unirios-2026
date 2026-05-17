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
import { colors } from '@/lib/colors';
import type { ExamDetail } from '@/types/classroom';

export default function TeacherActivityDetailScreen() {
  const { id, subjectId, classroomId, name } = useLocalSearchParams<{ id: string; subjectId: string; classroomId: string; name: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  function goBack() {
    router.replace(`/teacher/classroom/${classroomId}/subject/${subjectId}?name=${encodeURIComponent(name ?? '')}`);
  }

  const { data: activity, isLoading, isError } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => apiFetch<ExamDetail>(`/activities/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 56,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <TouchableOpacity
          onPress={() => goBack()}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '500' }}>Atividades</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
            {activity?.title ?? 'Atividade'}
          </Text>
        )}
      </View>

      {/* Body */}
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {isError && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 }}>
            Atividade não encontrada
          </Text>
          <TouchableOpacity onPress={() => goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && activity && (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Info card */}
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.primaryLight + '30',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Atividade
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.3 }}>
              {activity.title}
            </Text>
            {activity.description && (
              <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 20 }}>
                {activity.description}
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Ionicons name="help-circle-outline" size={15} color={colors.text.tertiary} />
              <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                {activity.questions.length} questão{activity.questions.length !== 1 ? 'ões' : ''}
              </Text>
              <Text style={{ fontSize: 13, color: colors.text.tertiary, marginLeft: 8 }}>
                · {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>

          {/* Questions */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
            Questões
          </Text>

          {activity.questions
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((q, i) => (
              <View
                key={q.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                    Questão {i + 1}
                  </Text>
                  <View
                    style={{
                      backgroundColor: q.options.length > 0 ? colors.primary + '15' : colors.surfaceAlt,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: q.options.length > 0 ? colors.primary : colors.text.tertiary }}>
                      {q.options.length > 0 ? 'Múltipla escolha' : 'Discursiva'}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 15, color: colors.text.primary, lineHeight: 22 }}>
                  {q.text}
                </Text>

                {q.options.length > 0 && (
                  <View style={{ gap: 6, marginTop: 2 }}>
                    {q.options
                      .slice()
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((opt) => (
                        <View
                          key={opt.id}
                          style={{
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: 10,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: colors.borderLight,
                          }}
                        >
                          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                            {opt.text}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );
}
