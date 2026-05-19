import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { useVoiceCommandStore } from '@/store/voiceCommand';
import { apiFetch } from '@/lib/api';
import { normalizeStr } from '@/lib/normalize';
import { speak } from '@/lib/tts';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Classroom } from '@/types/classroom';

export default function StudentClassroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const c = useColors();
  const scale = useScale();

  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);

  const { data: classroom, isLoading, isError } = useQuery({
    queryKey: ['classroom', id],
    queryFn: () => apiFetch<Classroom>(`/classrooms/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  useEffect(() => {
    if (lastCommand?.command !== 'NAVIGATE_TO_SUBJECT' || !lastCommand.payload?.name) return;
    const query = normalizeStr(lastCommand.payload.name as string);
    const found = classroom?.subjects.find(
      (s) => normalizeStr(s.name).includes(query) || query.includes(normalizeStr(s.name)),
    );
    if (found) {
      router.push(`/subject/${found.id}?name=${encodeURIComponent(found.name)}&classroomTitle=${encodeURIComponent(classroom!.title)}`);
    } else {
      speak(`Não encontrei a matéria ${lastCommand.payload.name} nesta turma.`);
    }
  }, [lastCommand]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.borderLight }}>
        <TouchableOpacity onPress={() => router.replace('/')} style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="chevron-back" size={20} color={c.primary} />
          <Text style={{ fontSize: scale(15), color: c.primary, fontWeight: '500' }}>Turmas</Text>
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator color={c.primary} />
        ) : (
          <>
            <Text style={{ fontSize: scale(24), fontWeight: '700', color: c.text.primary }}>{classroom?.title}</Text>
            {classroom?.description && (
              <Text style={{ fontSize: scale(14), color: c.text.secondary, marginTop: 4 }}>{classroom.description}</Text>
            )}
          </>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : !classroom?.subjects || classroom.subjects.length === 0 ? (
        <EmptyState iconName="library-outline" title="Nenhuma matéria disponível" message="O professor ainda não adicionou matérias a esta turma." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, marginBottom: 4 }}>Matérias</Text>
          {classroom.subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => router.push(`/subject/${s.id}?name=${encodeURIComponent(s.name)}&classroomTitle=${encodeURIComponent(classroom.title)}`)}
              style={{ backgroundColor: c.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: c.borderLight, flexDirection: 'row', alignItems: 'center', gap: 14 }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="book-outline" size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary }}>{s.name}</Text>
                {s.description && (
                  <Text style={{ fontSize: scale(13), color: c.text.secondary, marginTop: 2 }} numberOfLines={1}>{s.description}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
