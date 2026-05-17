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
import { useMyAttempts } from '@/hooks/useMyAttempts';
import { AttemptStatusBadge } from '@/components/student/AttemptStatusBadge';
import type { Exam } from '@/types/classroom';

export default function StudentSubjectScreen() {
  const { id, name, classroomTitle } = useLocalSearchParams<{
    id: string;
    name: string;
    classroomTitle: string;
  }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => apiFetch<Exam[]>(`/subjects/${id}/activities`, { token: token! }),
    enabled: !!id && !!token,
  });

  const { data: attempts, isLoading: attemptsLoading } = useMyAttempts();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          onPress={() => router.back()}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '500' }}>
            {decodeURIComponent(classroomTitle ?? '')}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
          {decodeURIComponent(name ?? '')}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
            Atividades
          </Text>

          {(!activities || activities.length === 0) && (
            <View
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: 16,
                padding: 28,
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 32 }}>📝</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 4 }}>
                Nenhuma atividade ainda
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>
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
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
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
                    backgroundColor: colors.primary + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                    {activity.title}
                  </Text>
                  {activity.description && (
                    <Text
                      style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {activity.description}
                    </Text>
                  )}
                  <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>
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
