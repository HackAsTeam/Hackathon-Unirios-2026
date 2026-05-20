import { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useScreenContext } from '@/hooks/useScreenContext';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';
import { useTeacherPendingAttempts } from '@/hooks/useTeacherPendingAttempts';
import { useStudentActivityStatuses } from '@/hooks/useStudentActivityStatuses';
import { useOnboardingStore } from '@/store/onboarding';
import { useAuthStore } from '@/store/auth';
import { useVoiceCommandStore } from '@/store/voiceCommand';
import { AttemptStatusBadge } from '@/components/student/AttemptStatusBadge';
import { JoinClassroomSheet } from '@/components/student/JoinClassroomSheet';
import { speak } from '@/lib/tts';
import { normalizeStr } from '@/lib/normalize';
import type { PendingAttemptItem, StudentActivityStatus } from '@/types/pending';
import type { AttemptStatus } from '@/types/attempt';

function TeacherPendencias() {
  const { data, isLoading, isError } = useTeacherPendingAttempts();
  useScreenContext({
    screen: 'teacher-pendencias',
    role: 'teacher',
    screenDescription: (() => {
      if (!data) return 'Você está na tela de Pendências do Professor. As correções estão carregando.';
      if (data.length === 0) return 'Você está na tela de Pendências do Professor. Nenhuma correção pendente — tudo em dia!';
      const map = new Map<string, { subjectName: string; count: number }>();
      for (const item of data) {
        const e = map.get(item.subjectId);
        if (e) e.count++; else map.set(item.subjectId, { subjectName: item.subjectName, count: 1 });
      }
      const resumo = [...map.values()].map(s => `${s.count} em ${s.subjectName}`).join(', ');
      return `Você está na tela de Pendências do Professor. Há ${data.length} tentativa${data.length !== 1 ? 's' : ''} aguardando correção: ${resumo}.`;
    })(),
  });
  const router = useRouter();
  const c = useColors();
  const scale = useScale();

  const grouped = useMemo(() => {
    const map = new Map<string, { subjectName: string; classroomTitle: string; items: PendingAttemptItem[] }>();
    for (const item of data ?? []) {
      const existing = map.get(item.subjectId);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.subjectId, { subjectName: item.subjectName, classroomTitle: item.classroomTitle, items: [item] });
      }
    }
    return map;
  }, [data]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, padding: 32, gap: 12 }}>
        <Ionicons name="alert-circle-outline" size={56} color={c.text.tertiary} />
        <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary, textAlign: 'center' }}>
          Não foi possível carregar as correções pendentes.
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, padding: 32, gap: 12 }}>
        <Ionicons name="checkmark-done-circle-outline" size={56} color={c.text.tertiary} />
        <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, textAlign: 'center' }}>
          Nenhuma correção pendente
        </Text>
        <Text style={{ fontSize: scale(14), color: c.text.secondary, textAlign: 'center' }}>
          Todas as atividades enviadas pelos alunos já foram corrigidas.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}>
      {[...grouped.entries()].map(([subjectId, group]) => (
        <View key={subjectId} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: scale(13), fontWeight: '700', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {group.subjectName}
              </Text>
              <Text style={{ fontSize: scale(12), color: c.text.tertiary }}>
                {group.classroomTitle}
              </Text>
            </View>
            <View style={{ backgroundColor: c.primary + '15', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: scale(12), fontWeight: '700', color: c.primary }}>
                {group.items.length}
              </Text>
            </View>
          </View>

          {group.items.map((item) => (
            <TouchableOpacity
              key={item.attemptId}
              onPress={() => router.push(`/teacher/attempt/${item.attemptId}?activityId=${item.activityId}&studentName=${encodeURIComponent(item.studentName)}`)}
              accessibilityRole="button"
              accessibilityLabel={`Corrigir tentativa de ${item.studentName} em ${item.activityTitle}`}
              style={{
                backgroundColor: c.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: c.borderLight,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: scale(16), fontWeight: '700', color: c.primary }}>
                  {item.studentName[0]?.toUpperCase() ?? 'A'}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: scale(15), fontWeight: '600', color: c.text.primary }}>
                  {item.studentName}
                </Text>
                <Text style={{ fontSize: scale(13), color: c.text.secondary }}>
                  {item.activityTitle}
                </Text>
                <Text style={{ fontSize: scale(12), color: c.text.tertiary, marginTop: 2 }}>
                  Enviado em {new Date(item.submittedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <AttemptStatusBadge status="Submitted" />
              <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function StudentPendencias({
  onOpenJoin,
  joinedClassroom,
}: {
  onOpenJoin: () => void;
  joinedClassroom: string | null;
}) {
  const { data, isLoading, isError } = useStudentActivityStatuses();
  useScreenContext({
    screen: 'student-pendencias',
    role: 'student',
    screenDescription: (() => {
      if (!data) return 'Você está na tela de Pendências. As atividades estão carregando.';
      if (data.length === 0) return 'Você está na tela de Pendências. Você não tem atividades no momento.';

      const concluidas = data.filter(a => a.attemptStatus === 'Submitted' || a.attemptStatus === 'Graded');
      const pendentes  = data.filter(a => !a.attemptStatus || a.attemptStatus === 'NotStarted' || a.attemptStatus === 'InProgress');

      const subjectMap = new Map<string, { subjectName: string; count: number }>();
      for (const item of data) {
        const e = subjectMap.get(item.subjectId);
        if (e) e.count++; else subjectMap.set(item.subjectId, { subjectName: item.subjectName, count: 1 });
      }
      const subjectList = [...subjectMap.values()]
        .map(s => `${s.subjectName} com ${s.count} atividade${s.count !== 1 ? 's' : ''}`)
        .join(', ');

      return [
        `Você está na tela de Pendências, com ${data.length} atividade${data.length !== 1 ? 's' : ''} no total.`,
        `Matérias: ${subjectList}.`,
        `${concluidas.length} concluída${concluidas.length !== 1 ? 's' : ''} e ${pendentes.length} pendente${pendentes.length !== 1 ? 's' : ''}.`,
      ].join(' ');
    })(),
  });
  const router = useRouter();
  const c = useColors();
  const scale = useScale();
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);

  const grouped = useMemo(() => {
    const map = new Map<string, { subjectName: string; classroomTitle: string; items: StudentActivityStatus[] }>();
    for (const item of data ?? []) {
      const existing = map.get(item.subjectId);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.subjectId, { subjectName: item.subjectName, classroomTitle: item.classroomTitle, items: [item] });
      }
    }
    return map;
  }, [data]);

  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const pendingScrollSubject = useRef<string | null>(null);

  const attemptScroll = () => {
    const name = pendingScrollSubject.current;
    if (!name) return;
    const query = normalizeStr(name);
    const entry = [...grouped.entries()].find(
      ([, group]) =>
        normalizeStr(group.subjectName).includes(query) ||
        query.includes(normalizeStr(group.subjectName))
    );
    if (!entry) {
      if (!isLoading) {
        pendingScrollSubject.current = null;
        speak(`Não encontrei a matéria ${name}.`);
      }
      return;
    }
    const [subjectId, group] = entry;
    const y = sectionOffsets.current[subjectId];
    if (y == null) return; // seção ainda não medida — repete no onLayout
    pendingScrollSubject.current = null;
    scrollRef.current?.scrollTo({ y, animated: true });
    speak(`Mostrando ${group.subjectName}.`);
    AccessibilityInfo.announceForAccessibility(`Matéria ${group.subjectName}`);
  };

  useEffect(() => {
    if (!lastCommand) return;
    if (lastCommand.command === 'OPEN_JOIN_MODAL') {
      onOpenJoin();
    } else if (lastCommand.command === 'NAVIGATE_TO_SUBJECT' && lastCommand.payload?.name) {
      pendingScrollSubject.current = lastCommand.payload.name as string;
      attemptScroll();
    }
  }, [lastCommand]);

  // Reexecuta o scroll pendente quando os dados terminam de carregar.
  useEffect(() => {
    attemptScroll();
  }, [isLoading, data]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, padding: 32, gap: 12 }}>
        <Ionicons name="alert-circle-outline" size={56} color={c.text.tertiary} />
        <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary, textAlign: 'center' }}>
          Não foi possível carregar as atividades pendentes.
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, padding: 32, gap: 12 }}>
        <Ionicons name="checkmark-done-circle-outline" size={56} color={c.text.tertiary} />
        <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary, textAlign: 'center' }}>
          Nenhuma atividade pendente
        </Text>
        <Text style={{ fontSize: scale(14), color: c.text.secondary, textAlign: 'center' }}>
          Você não tem atividades para responder no momento.
        </Text>
        <TouchableOpacity
          onPress={onOpenJoin}
          accessibilityLabel="Entrar em uma turma"
          accessibilityRole="button"
          style={{
            marginTop: 8,
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: c.primary,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: scale(14), fontWeight: '600', color: '#fff' }}>
            Entrar em uma turma
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}>
      {[...grouped.entries()].map(([subjectId, group]) => (
        <View
          key={subjectId}
          style={{ gap: 8 }}
          onLayout={(e) => {
            sectionOffsets.current[subjectId] = e.nativeEvent.layout.y;
            attemptScroll();
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: scale(13), fontWeight: '700', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {group.subjectName}
              </Text>
              <Text style={{ fontSize: scale(12), color: c.text.tertiary }}>
                {group.classroomTitle}
              </Text>
            </View>
          </View>

          {group.items.map((item) => {
            const progressText = item.answeredCount > 0
              ? `${item.answeredCount}/${item.totalQuestions} respondidas`
              : 'Não iniciada';
            const onPress = () => router.push(`/activity/${item.activityId}`);

            return (
              <TouchableOpacity
                key={item.activityId}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`Atividade ${item.activityTitle}, ${progressText}`}
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: c.borderLight,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: scale(15), fontWeight: '600', color: c.text.primary }}>
                    {item.activityTitle}
                  </Text>
                  <Text style={{ fontSize: scale(13), color: c.text.secondary, marginTop: 2 }}>
                    {progressText}
                  </Text>
                </View>
                {item.attemptStatus && (
                  <AttemptStatusBadge status={item.attemptStatus as AttemptStatus} />
                )}
                <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

export default function PendenciasTab() {
  const onboardingRole = useOnboardingStore((s) => s.role);
  const authRole = useAuthStore((s) => s.role);
  const role = onboardingRole ?? authRole;
  const c = useColors();
  const scale = useScale();
  const [showJoin, setShowJoin] = useState(false);
  const [joinedClassroom, setJoinedClassroom] = useState<string | null>(null);

  useEffect(() => {
    if (joinedClassroom) {
      const timer = setTimeout(() => setJoinedClassroom(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [joinedClassroom]);

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
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: scale(26), fontWeight: '800', color: c.text.primary, letterSpacing: -0.5 }}>
          Pendências
        </Text>
        {role !== 'teacher' && (
          <TouchableOpacity
            onPress={() => setShowJoin(true)}
            accessibilityLabel="Entrar em uma turma"
            accessibilityRole="button"
            accessibilityHint="Abre a folha para ingressar em uma turma com código de convite"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: scale(24), fontWeight: '600', color: '#fff' }}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {joinedClassroom && (
        <View
          style={{
            backgroundColor: c.successLight,
            marginHorizontal: 20,
            marginTop: 8,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="checkmark-circle" size={18} color={c.success} />
          <Text style={{ fontSize: scale(14), color: c.primaryDark, fontWeight: '600', flex: 1 }}>
            Você entrou em "{joinedClassroom}"!
          </Text>
        </View>
      )}

      {role === 'teacher' ? (
        <TeacherPendencias />
      ) : (
        <>
          <StudentPendencias onOpenJoin={() => setShowJoin(true)} joinedClassroom={joinedClassroom} />
          <JoinClassroomSheet
            visible={showJoin}
            onClose={() => setShowJoin(false)}
            onJoined={(title) => setJoinedClassroom(title)}
          />
        </>
      )}
    </View>
  );
}
