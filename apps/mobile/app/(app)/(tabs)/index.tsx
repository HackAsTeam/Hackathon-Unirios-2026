import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth';
import { Header } from '@/components/ui/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardHeader } from '@/components/ui/Card';
import { colors } from '@/lib/colors';
import { apiFetch } from '../../../lib/api';
import type { Classroom, InvitationLinkResponse } from '../../../types/classroom';

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
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      placeholderTextColor={colors.text.tertiary}
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.text.primary,
        backgroundColor: colors.surface,
        minHeight: multiline ? 80 : undefined,
        textAlignVertical: multiline ? 'top' : undefined,
      }}
    />
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

  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => apiFetch<Classroom[]>('/classrooms', { token: token! }),
    enabled: !!token,
  });

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const createClassroom = useMutation({
    mutationFn: () =>
      apiFetch('/classrooms', {
        method: 'POST',
        token: token!,
        body: { title, description: desc || undefined },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      setShowCreate(false);
      setTitle('');
      setDesc('');
    },
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header
          title={`Olá, ${displayName ?? 'Usuário'}!`}
          subtitle="Gerencie suas turmas"
          rightAction={roleBadge(roleLabel)}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={`Olá, ${displayName ?? 'Usuário'}!`}
        subtitle="Gerencie suas turmas"
        rightAction={roleBadge(roleLabel)}
      />

      {(!classrooms || classrooms.length === 0) ? (
        <EmptyState
          icon="🏫"
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
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>
              Suas Turmas
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: colors.primaryLight,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                + Nova Turma
              </Text>
            </TouchableOpacity>
          </View>

          {classrooms.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => router.push(`/teacher/classroom/${c.id}`)}
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
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="school-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
                  {c.title}
                </Text>
                {c.description && (
                  <Text
                    style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {c.description}
                  </Text>
                )}
                <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>
                  {c.subjects.length} matéria{c.subjects.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create classroom modal */}
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
              backgroundColor: colors.background,
              borderRadius: 24,
              padding: 24,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text.primary,
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
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.secondary }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => title.trim() && createClassroom.mutate()}
                disabled={createClassroom.isPending || !title.trim()}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  opacity: createClassroom.isPending || !title.trim() ? 0.6 : 1,
                }}
              >
                {createClassroom.isPending ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.inverse }}>
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
  const queryClient = useQueryClient();
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => apiFetch<Classroom[]>('/classrooms', { token: token! }),
    enabled: !!token,
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

  function handleJoinConfirm() {
    if (!joinInput.trim()) return;
    setJoinError(null);
    joinClassroom.mutate(extractToken(joinInput));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={`Olá, ${displayName ?? 'Usuário'}!`}
        subtitle="Suas atividades"
        rightAction={roleBadge(roleLabel)}
      />

      {joinSuccess && (
        <View style={{
          backgroundColor: colors.successLight,
          marginHorizontal: 20,
          marginTop: 8,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={{ fontSize: 14, color: colors.primaryDark, fontWeight: '600', flex: 1 }}>
            {joinSuccess}
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!isLoading && (!classrooms || classrooms.length === 0) && (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon="📚"
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
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary,
              }}
            >
              Minhas Turmas
            </Text>
            <TouchableOpacity
              onPress={() => setShowJoin(true)}
              accessibilityLabel="Ingressar em turma com código"
              accessibilityRole="button"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: colors.primaryLight,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="enter-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                Ingressar
              </Text>
            </TouchableOpacity>
          </View>
          {classrooms.map((c) => (
            <StudentClassroomCard
              key={c.id}
              classroom={c}
              expanded={expandedId === c.id}
              onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Join classroom modal */}
      <Modal
        visible={showJoin}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowJoin(false); setJoinError(null); }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => { setShowJoin(false); setJoinError(null); }} />
          <View style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 36,
            gap: 16,
          }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>
              Ingressar em Turma
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: -8 }}>
              Cole o link ou código que o professor enviou
            </Text>
            <TextInput
              value={joinInput}
              onChangeText={(v) => { setJoinInput(v); setJoinError(null); }}
              placeholder="https://... ou código do convite"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: joinError ? colors.error : colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: colors.text.primary,
                backgroundColor: colors.surface,
              }}
            />
            {joinError && (
              <Text style={{ fontSize: 13, color: colors.error, marginTop: -8 }}>
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
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.secondary }}>
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
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  opacity: joinClassroom.isPending || !joinInput.trim() ? 0.6 : 1,
                }}
              >
                {joinClassroom.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
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

function StudentClassroomCard({
  classroom,
  expanded,
  onToggle,
}: {
  classroom: Classroom;
  expanded: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();

  return (
    <Card variant="elevated" onPress={onToggle}>
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
        <Text style={{ fontSize: 18, color: colors.text.tertiary }}>{expanded ? '▾' : '▸'}</Text>
      </View>

      {expanded && (
        <View style={{ marginTop: 8, gap: 8 }}>
          {classroom.subjects.length === 0 && (
            <Text
              style={{ fontSize: 14, color: colors.text.tertiary, textAlign: 'center', padding: 12 }}
            >
              Nenhuma matéria disponível ainda.
            </Text>
          )}

          {classroom.subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              onPress={() =>
                router.push(
                  `/subject/${subject.id}?name=${encodeURIComponent(subject.name)}&classroomTitle=${encodeURIComponent(classroom.title)}`
                )
              }
              accessibilityLabel={`Abrir matéria: ${subject.name}`}
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.primaryLight + '30',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="book-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                  {subject.name}
                </Text>
                {subject.description && (
                  <Text
                    style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {subject.description}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
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

  if (isTeacher) {
    return <TeacherHome token={token} displayName={displayName} roleLabel={roleLabel} />;
  }

  return (
    <StudentHome
      token={token}
      displayName={displayName}
      roleLabel={roleLabel}
    />
  );
}

function roleBadge(label: string) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceAlt,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>{label}</Text>
    </View>
  );
}
