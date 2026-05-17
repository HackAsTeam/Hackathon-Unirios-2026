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
import { useScreenContext } from '@/hooks/useScreenContext';
import { apiFetch } from '@/lib/api';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';
import type { ExamDetail } from '@/types/classroom';
import type { ActivityAttemptSummary, AttemptStatus } from '@/types/attempt';
import { AttemptStatusBadge } from '@/components/student/AttemptStatusBadge';

export default function TeacherActivityDetailScreen() {
  const { id, subjectId, classroomId, name } = useLocalSearchParams<{ id: string; subjectId: string; classroomId: string; name: string }>();
  useScreenContext({ screen: 'teacher-activity', activityId: id, subjectId, classroomId, role: 'teacher' });
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const c = useColors();
  const scale = useScale();

  function goBack() {
    router.replace(`/teacher/classroom/${classroomId}/subject/${subjectId}?name=${encodeURIComponent(name ?? '')}`);
  }

  const { data: activity, isLoading, isError } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => apiFetch<ExamDetail>(`/activities/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['activity', id, 'attempts'],
    queryFn: () => apiFetch<ActivityAttemptSummary[]>(`/activities/${id}/attempts`, { token: token! }),
    enabled: !!id && !!token,
  });

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
          onPress={() => goBack()}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={c.primary} />
          <Text style={{ fontSize: scale(15), color: c.primary, fontWeight: '500' }}>Atividades</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator color={c.primary} />
        ) : (
          <Text style={{ fontSize: scale(24), fontWeight: '700', color: c.text.primary }}>
            {activity?.title ?? 'Atividade'}
          </Text>
        )}
      </View>

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      )}

      {isError && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, textAlign: 'center', marginBottom: 8 }}>
            Atividade não encontrada
          </Text>
          <TouchableOpacity onPress={() => goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: c.primary, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && activity && (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View
            style={{
              backgroundColor: c.surfaceAlt,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: c.primaryLight + '30',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: scale(13), fontWeight: '600', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Atividade
            </Text>
            <Text style={{ fontSize: scale(20), fontWeight: '800', color: c.text.primary, letterSpacing: -0.3 }}>
              {activity.title}
            </Text>
            {activity.description && (
              <Text style={{ fontSize: scale(14), color: c.text.secondary, lineHeight: 20 }}>
                {activity.description}
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Ionicons name="help-circle-outline" size={15} color={c.text.tertiary} />
              <Text style={{ fontSize: scale(13), color: c.text.tertiary }}>
                {activity.questions.length} questão{activity.questions.length !== 1 ? 'ões' : ''}
              </Text>
              <Text style={{ fontSize: scale(13), color: c.text.tertiary, marginLeft: 8 }}>
                · {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: scale(16), fontWeight: '700', color: c.text.primary }}>
            Questões
          </Text>

          {activity.questions
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((q, i) => (
              <View
                key={q.id}
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 16,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: c.borderLight,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: scale(13), fontWeight: '600', color: c.primary }}>
                    Questão {i + 1}
                  </Text>
                  <View
                    style={{
                      backgroundColor: q.options.length > 0 ? c.primary + '15' : c.surfaceAlt,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ fontSize: scale(11), fontWeight: '600', color: q.options.length > 0 ? c.primary : c.text.tertiary }}>
                      {q.options.length > 0 ? 'Múltipla escolha' : 'Discursiva'}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: scale(15), color: c.text.primary, lineHeight: 22 }}>
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
                            backgroundColor: c.surfaceAlt,
                            borderRadius: 10,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: c.borderLight,
                          }}
                        >
                          <Text style={{ fontSize: scale(14), color: c.text.secondary }}>
                            {opt.text}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}

          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text.primary, marginBottom: 12 }}>
              Respostas dos Alunos
            </Text>
            {attemptsLoading && <ActivityIndicator color={c.primary} size="small" />}
            {!attemptsLoading && (!attempts || attempts.length === 0) && (
              <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 20, alignItems: 'center', gap: 6 }}>
                <Ionicons name="people-outline" size={28} color={c.text.tertiary} />
                <Text style={{ fontSize: 14, color: c.text.tertiary, textAlign: 'center' }}>
                  Nenhuma resposta submetida ainda
                </Text>
              </View>
            )}
            {attempts?.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => router.push(`/teacher/attempt/${a.id}?activityId=${id}&studentName=${encodeURIComponent(a.studentName ?? 'Aluno')}`)}
                style={{ backgroundColor: c.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: c.borderLight, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: c.primary }}>
                    {(a.studentName ?? 'A')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: c.text.primary }}>{a.studentName ?? 'Aluno'}</Text>
                  <Text style={{ fontSize: 12, color: c.text.tertiary, marginTop: 2 }}>
                    Enviado em {new Date(a.submittedAt ?? a.startedAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <AttemptStatusBadge status={a.status as AttemptStatus} />
                <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
