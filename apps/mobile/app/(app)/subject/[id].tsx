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
import { useMyAttempts } from '@/hooks/useMyAttempts';
import { AttemptStatusBadge } from '@/components/student/AttemptStatusBadge';
import { useScreenContext } from '@/hooks/useScreenContext';
import type { Exam } from '@/types/classroom';

export default function StudentSubjectScreen() {
  const { id, name, classroomTitle, classroomId } = useLocalSearchParams<{
    id: string;
    name: string;
    classroomTitle: string;
    classroomId?: string;
  }>();
  useScreenContext({ screen: 'student-subject', subjectId: id, classroomId: classroomId, role: 'student' });
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const c = useColors();
  const scale = useScale();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => apiFetch<Exam[]>(`/subjects/${id}/activities`, { token: token! }),
    enabled: !!id && !!token,
  });

  const { data: attempts, isLoading: attemptsLoading } = useMyAttempts();

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
          onPress={() => router.back()}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={c.primary} />
          <Text style={{ fontSize: scale(15), color: c.primary, fontWeight: '500' }}>
            {decodeURIComponent(classroomTitle ?? '')}
          </Text>
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
          <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, marginBottom: 4 }}>
            Atividades
          </Text>

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
              <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary, marginTop: 4 }}>
                Nenhuma atividade ainda
              </Text>
              <Text style={{ fontSize: scale(14), color: c.text.secondary, textAlign: 'center' }}>
                O professor ainda não publicou atividades nesta matéria.
              </Text>
            </View>
          )}

          {activities?.map((activity) => {
            const attempt = attempts?.find((a) => a.examId === activity.id);
            return (
              <TouchableOpacity
                key={activity.id}
                onPress={() => router.push(`/activity/${activity.id}`)}
                accessibilityLabel={`Abrir atividade: ${activity.title}`}
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
                    {activity.title}
                  </Text>
                  {activity.description && (
                    <Text
                      style={{ fontSize: scale(13), color: c.text.secondary, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {activity.description}
                    </Text>
                  )}
                  <Text style={{ fontSize: scale(12), color: c.text.tertiary, marginTop: 4 }}>
                    {activity.questionCount} questão{activity.questionCount !== 1 ? 'ões' : ''}
                  </Text>
                </View>
                {!attemptsLoading && (
                  <AttemptStatusBadge status={attempt?.status ?? null} score={attempt?.score} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
