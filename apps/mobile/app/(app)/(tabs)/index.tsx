import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth';
import { speak } from '../../../lib/tts';
import { normalizeStr } from '../../../lib/normalize';
import { useScreenContext } from '../../../hooks/useScreenContext';
import { useVoiceCommandStore } from '../../../store/voiceCommand';
import { Header } from '@/components/ui/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardHeader } from '@/components/ui/Card';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';
import { apiFetch } from '../../../lib/api';
import type { Classroom } from '../../../types/classroom';

function Input({
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const c = useColors();
  const scale = useScale();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      placeholderTextColor={c.text.tertiary}
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        padding: 14,
        fontSize: scale(16),
        color: c.text.primary,
        backgroundColor: c.surface,
        minHeight: multiline ? 80 : undefined,
        textAlignVertical: multiline ? 'top' : undefined,
      }}
    />
  );
}

function RoleBadge({ label }: { label: string }) {
  const c = useColors();
  const scale = useScale();
  return (
    <View
      style={{
        backgroundColor: c.surfaceAlt,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: c.borderLight,
      }}
    >
      <Text style={{ fontSize: scale(12), fontWeight: '600', color: c.primary }}>{label}</Text>
    </View>
  );
}

// ─── Teacher view ─────────────────────────────────────────────────────────────

function TeacherHome({
  token,
  displayName,
  roleLabel,
}: {
  token: string | null;
  displayName: string | null;
  roleLabel: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const c = useColors();
  const scale = useScale();
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);

  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => apiFetch<Classroom[]>('/classrooms', { token: token! }),
    enabled: !!token,
  });

  useScreenContext({
    screen: 'home-teacher',
    role: 'teacher',
    classroomCount: classrooms?.length ?? 0,
    screenDescription: (() => {
      const name = displayName ?? 'Usuário';
      if (!classrooms) return `Você está na tela inicial como Professor. No topo, temos o seu nome ${name}. As turmas ainda estão carregando.`;
      if (classrooms.length === 0) return `Você está na tela inicial como Professor. No topo, temos o seu nome ${name}. No centro, um convite para criar a primeira turma, com um botão Criar Turma.`;
      const nomes = classrooms.map(c => c.title).join(', ');
      return `Você está na tela inicial como Professor. No topo, temos o seu nome ${name}. No canto superior direito, um indicador de que você é Professor. No centro, uma lista com ${classrooms.length} turma${classrooms.length !== 1 ? 's' : ''}: ${nomes}. No canto superior direito da lista, botão para criar nova turma.`;
    })(),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const createClassroom = useMutation({
    mutationFn: ({ t, d }: { t: string; d?: string }) =>
      apiFetch('/classrooms', {
        method: 'POST',
        token: token!,
        body: { title: t, description: d || undefined },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      setShowCreate(false);
      setTitle('');
      setDesc('');
    },
  });

  useEffect(() => {
    if (!lastCommand) return;
    if (lastCommand.command === 'CREATE_CLASSROOM' && lastCommand.payload?.title) {
      const t = lastCommand.payload.title as string;
      const d = lastCommand.payload.description as string | undefined;
      createClassroom.mutate({ t, d });
    } else if (lastCommand.command === 'OPEN_CREATE_CLASSROOM_MODAL') {
      setShowCreate(true);
    } else if (lastCommand.command === 'NAVIGATE_TO_CLASSROOM' && lastCommand.payload?.name) {
      const query = normalizeStr(lastCommand.payload.name as string);
      const found = classrooms?.find((c) => normalizeStr(c.title).includes(query) || query.includes(normalizeStr(c.title)));
      if (found) {
        router.push(`/teacher/classroom/${found.id}`);
      } else {
        speak(`Não encontrei nenhuma turma chamada ${lastCommand.payload.name}.`);
      }
    }
  }, [lastCommand]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <Header
          title={`Olá, ${displayName ?? 'Usuário'}!`}
          subtitle="Gerencie suas turmas"
          rightAction={<RoleBadge label={roleLabel} />}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title={`Olá, ${displayName ?? 'Usuário'}!`}
        subtitle="Gerencie suas turmas"
        rightAction={<RoleBadge label={roleLabel} />}
      />

      {(!classrooms || classrooms.length === 0) ? (
        <EmptyState
          iconName="school-outline"
          title="Vamos criar uma turma?"
          message="Crie sua primeira turma para começar a adicionar matérias e atividades."
          actionLabel="Criar Turma"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary }}>
              Suas Turmas
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              accessibilityLabel="Criar nova turma"
              accessibilityRole="button"
              style={{
                backgroundColor: c.surfaceAlt,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: c.primaryLight,
              }}
            >
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.primary }}>
                + Nova Turma
              </Text>
            </TouchableOpacity>
          </View>

          {classrooms.map((classroom) => (
            <TouchableOpacity
              key={classroom.id}
              onPress={() => router.push(`/teacher/classroom/${classroom.id}`)}
              accessibilityLabel={`Turma ${classroom.title}${classroom.description ? `, ${classroom.description}` : ''}, ${classroom.subjects.length} matéria${classroom.subjects.length !== 1 ? 's' : ''}`}
              accessibilityRole="button"
              accessibilityHint="Toque para gerenciar a turma"
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
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: c.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="school-outline" size={24} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: scale(16), fontWeight: '700', color: c.text.primary }}>
                  {classroom.title}
                </Text>
                {classroom.description && (
                  <Text
                    style={{ fontSize: scale(13), color: c.text.secondary, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {classroom.description}
                  </Text>
                )}
                <Text style={{ fontSize: scale(12), color: c.text.tertiary, marginTop: 4 }}>
                  {classroom.subjects.length} matéria{classroom.subjects.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreate(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: 24,
          }}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCreate(false)} />
          <View
            style={{
              backgroundColor: c.background,
              borderRadius: 24,
              padding: 24,
            }}
          >
            <Text
              style={{
                fontSize: scale(20),
                fontWeight: '700',
                color: c.text.primary,
                marginBottom: 16,
              }}
            >
              Nova Turma
            </Text>
            <View style={{ gap: 12 }}>
              <Input value={title} onChangeText={setTitle} placeholder="Nome da turma" />
              <Input
                value={desc}
                onChangeText={setDesc}
                placeholder="Descrição (opcional)"
                multiline
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setShowCreate(false)}
                disabled={createClassroom.isPending}
                accessibilityLabel="Cancelar criação de turma"
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.secondary }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => title.trim() && createClassroom.mutate({ t: title, d: desc })}
                disabled={createClassroom.isPending || !title.trim()}
                accessibilityLabel="Confirmar criação de turma"
                accessibilityRole="button"
                accessibilityState={{ disabled: createClassroom.isPending || !title.trim() }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: c.primary,
                  alignItems: 'center',
                  opacity: createClassroom.isPending || !title.trim() ? 0.6 : 1,
                }}
              >
                {createClassroom.isPending ? (
                  <ActivityIndicator color={c.text.inverse} size="small" />
                ) : (
                  <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.inverse }}>
                    Criar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCreate(false)} />
        </View>
      </Modal>
    </View>
  );
}

// ─── Student view ─────────────────────────────────────────────────────────────

function extractToken(input: string): string {
  const match = input.match(/\/i\/([^/?#\s]+)/);
  return match ? match[1] : input.trim();
}

function StudentHome({
  token,
  displayName,
  roleLabel,
}: {
  token: string | null;
  displayName: string | null;
  roleLabel: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const c = useColors();
  const scale = useScale();
  const lastCommand = useVoiceCommandStore((s) => s.lastCommand);
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => apiFetch<Classroom[]>('/classrooms', { token: token! }),
    enabled: !!token,
  });

  useScreenContext({
    screen: 'home-student',
    role: 'student',
    classroomCount: classrooms?.length ?? 0,
    hasEnrollments: (classrooms?.length ?? 0) > 0,
    screenDescription: (() => {
      const name = displayName ?? 'Usuário';
      if (!classrooms) return `Você está na tela inicial como Aluno. No topo, temos o seu nome ${name}. As turmas ainda estão carregando.`;
      if (classrooms.length === 0) return `Você está na tela inicial como Aluno. No topo, temos o seu nome ${name}. No centro, um convite para ingressar em uma turma, com um botão Ingressar com código.`;
      const nomes = classrooms.map(c => c.title).join(', ');
      return `Você está na tela inicial como Aluno. No topo, temos o seu nome ${name}. No canto superior direito, um indicador de que você é Aluno. No centro, uma lista com ${classrooms.length} turma${classrooms.length !== 1 ? 's' : ''}: ${nomes}. No canto superior direito da lista, botão para ingressar em nova turma.`;
    })(),
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const joinClassroom = useMutation({
    mutationFn: (inviteToken: string) =>
      apiFetch<{ classroomId: string; classroomTitle: string; studentId: string; joinedAt: string }>(
        '/invitations/join',
        { method: 'POST', token: token!, body: { token: inviteToken } }
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      setShowJoin(false);
      setJoinInput('');
      setJoinError(null);
      setJoinSuccess(`Você entrou em "${data.classroomTitle}"!`);
      setTimeout(() => setJoinSuccess(null), 4000);
    },
    onError: (e: Error) => {
      const msg = e.message.toLowerCase();
      if (msg.includes('already') || msg.includes('enrolled')) {
        setJoinError('Você já faz parte desta turma.');
      } else if (msg.includes('404') || msg.includes('invalid') || msg.includes('expired')) {
        setJoinError('Link inválido ou expirado. Peça um novo convite ao professor.');
      } else {
        setJoinError('Não foi possível ingressar na turma. Tente novamente.');
      }
    },
  });

  useEffect(() => {
    if (!lastCommand) return;
    if (lastCommand.command === 'OPEN_JOIN_MODAL') {
      setShowJoin(true);
    } else if (lastCommand.command === 'NAVIGATE_TO_CLASSROOM' && lastCommand.payload?.name) {
      const query = normalizeStr(lastCommand.payload.name as string);
      const found = classrooms?.find((c) => normalizeStr(c.title).includes(query) || query.includes(normalizeStr(c.title)));
      if (found) {
        router.push(`/student/classroom/${found.id}`);
      } else {
        speak(`Não encontrei nenhuma turma chamada ${lastCommand.payload.name}.`);
      }
    }
  }, [lastCommand]);

  function handleJoinConfirm() {
    if (!joinInput.trim()) return;
    setJoinError(null);
    joinClassroom.mutate(extractToken(joinInput));
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title={`Olá, ${displayName ?? 'Usuário'}!`}
        subtitle="Suas atividades"
        rightAction={<RoleBadge label={roleLabel} />}
      />

      {joinSuccess && (
        <View style={{
          backgroundColor: c.successLight,
          marginHorizontal: 20,
          marginTop: 8,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <Ionicons name="checkmark-circle" size={18} color={c.success} />
          <Text style={{ fontSize: scale(14), color: c.primaryDark, fontWeight: '600', flex: 1 }}>
            {joinSuccess}
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      )}

      {!isLoading && (!classrooms || classrooms.length === 0) && (
        <View style={{ flex: 1 }}>
          <EmptyState
            iconName="library-outline"
            title="Nenhuma turma ainda"
            message="Peça um link de convite ao seu professor e ingresse em uma turma."
            actionLabel="Ingressar com código"
            onAction={() => setShowJoin(true)}
          />
        </View>
      )}

      {!isLoading && classrooms && classrooms.length > 0 && (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary }}>
              Minhas Turmas
            </Text>
            <TouchableOpacity
              onPress={() => setShowJoin(true)}
              accessibilityLabel="Ingressar em turma com código"
              accessibilityRole="button"
              style={{
                backgroundColor: c.surfaceAlt,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: c.primaryLight,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="enter-outline" size={16} color={c.primary} />
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.primary }}>
                Ingressar
              </Text>
            </TouchableOpacity>
          </View>
          {classrooms.map((classroom) => (
            <StudentClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </ScrollView>
      )}

      <Modal
        visible={showJoin}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowJoin(false); setJoinError(null); }}
      >
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <TouchableOpacity style={{ flex:1, zIndex: 0, position: "absolute", width: "100%", height: "100%" }} onPress={() => { setShowJoin(false); setJoinError(null); }} />
          <View style={{
            backgroundColor: c.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 36,
            gap: 16,
          }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
            </View>
            <Text style={{ fontSize: scale(20), fontWeight: '700', color: c.text.primary }}>
              Ingressar em Turma
            </Text>
            <Text style={{ fontSize: scale(14), color: c.text.secondary, marginTop: -8 }}>
              Cole o link ou código que o professor enviou
            </Text>
            <TextInput
              value={joinInput}
              onChangeText={(v) => { setJoinInput(v); setJoinError(null); }}
              placeholder="https://... ou código do convite"
              placeholderTextColor={c.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: joinError ? c.error : c.border,
                borderRadius: 12,
                padding: 14,
                fontSize: scale(15),
                color: c.text.primary,
                backgroundColor: c.surface,
              }}
            />
            {joinError && (
              <Text style={{ fontSize: scale(13), color: c.error, marginTop: -8 }}>
                {joinError}
              </Text>
            )}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => { setShowJoin(false); setJoinInput(''); setJoinError(null); }}
                disabled={joinClassroom.isPending}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.secondary }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleJoinConfirm}
                disabled={joinClassroom.isPending || !joinInput.trim()}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: c.primary,
                  alignItems: 'center',
                  opacity: joinClassroom.isPending || !joinInput.trim() ? 0.6 : 1,
                }}
              >
                {joinClassroom.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ fontSize: scale(16), fontWeight: '600', color: '#fff' }}>
                    Confirmar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StudentClassroomCard({ classroom }: { classroom: Classroom }) {
  const router = useRouter();
  const c = useColors();

  return (
    <Card variant="elevated" onPress={() => router.push(`/student/classroom/${classroom.id}`)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <CardHeader
            title={classroom.title}
            subtitle={
              classroom.description ??
              `${classroom.subjects.length} matéria${classroom.subjects.length !== 1 ? 's' : ''}`
            }
          />
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
      </View>
    </Card>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const token = useAuthStore((s) => s.token);
  const displayName = useAuthStore((s) => s.displayName);
  const role = useAuthStore((s) => s.role);
  const isTeacher = role?.toLowerCase() === 'teacher';
  const roleLabel = isTeacher ? 'Professor' : 'Aluno';

  if (role?.toLowerCase() === 'student') {
    return <Redirect href="/(app)/(tabs)/pendencias" />;
  }

  return <TeacherHome token={token} displayName={displayName} roleLabel={roleLabel} />;
}
