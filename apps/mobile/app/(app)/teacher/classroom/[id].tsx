import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';
import type { Classroom, InvitationLinkResponse, ClassroomMember } from '@/types/classroom';

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
        minHeight: multiline ? 72 : undefined,
        textAlignVertical: multiline ? 'top' : undefined,
      }}
    />
  );
}

export default function ClassroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const c = useColors();
  const scale = useScale();

  const { data: classroom, isLoading } = useQuery({
    queryKey: ['classroom', id],
    queryFn: () => apiFetch<Classroom>(`/classrooms/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['classroom', id, 'members'],
    queryFn: () => apiFetch<ClassroomMember[]>(`/classrooms/${id}/members`, { token: token! }),
    enabled: !!id && !!token,
  });

  const students = members?.filter((m) => m.role === 'student') ?? [];

  const [showCreate, setShowCreate] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');

  const [activeInvite, setActiveInvite] = useState<InvitationLinkResponse | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const generateInvite = useMutation({
    mutationFn: () =>
      apiFetch<InvitationLinkResponse>('/invitations', {
        method: 'POST',
        token: token!,
        body: { classroomId: id, expiresAt: null },
      }),
    onSuccess: (data) => {
      setActiveInvite(data);
      setInviteError(null);
    },
    onError: () => setInviteError('Não foi possível gerar o link. Tente novamente.'),
  });

  const revokeInvite = useMutation({
    mutationFn: (inviteId: string) =>
      apiFetch(`/invitations/${inviteId}`, { method: 'DELETE', token: token! }),
    onSuccess: () => setActiveInvite(null),
    onError: () => setInviteError('Não foi possível revogar o convite.'),
  });

  async function handleShare() {
    if (!activeInvite) return;
    try {
      await Share.share({ message: activeInvite.inviteUrl });
    } catch {}
  }

  const createSubject = useMutation({
    mutationFn: () =>
      apiFetch(`/classrooms/${id}/subjects`, {
        method: 'POST',
        token: token!,
        body: { name: subjectName, description: subjectDesc || undefined },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', id] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      setShowCreate(false);
      setSubjectName('');
      setSubjectDesc('');
    },
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
          onPress={() => router.replace('/')}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={c.primary} />
          <Text style={{ fontSize: scale(15), color: c.primary, fontWeight: '500' }}>Turmas</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator color={c.primary} />
        ) : (
          <>
            <Text style={{ fontSize: scale(24), fontWeight: '700', color: c.text.primary }}>
              {classroom?.title}
            </Text>
            {classroom?.description && (
              <Text style={{ fontSize: scale(14), color: c.text.secondary, marginTop: 4 }}>
                {classroom.description}
              </Text>
            )}
          </>
        )}
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
              Matérias
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
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
                + Nova Matéria
              </Text>
            </TouchableOpacity>
          </View>

          {(!classroom?.subjects || classroom.subjects.length === 0) && (
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
              <Ionicons name="library-outline" size={48} color={c.text.tertiary} />
              <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary, marginTop: 4 }}>
                Nenhuma matéria ainda
              </Text>
              <Text style={{ fontSize: scale(14), color: c.text.secondary, textAlign: 'center' }}>
                Crie a primeira matéria para organizar as atividades desta turma.
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{
                  marginTop: 8,
                  backgroundColor: c.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                }}
              >
                <Text style={{ fontSize: scale(15), fontWeight: '600', color: c.text.inverse }}>
                  Criar Matéria
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {classroom?.subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() =>
                router.push(
                  `/teacher/classroom/${id}/subject/${s.id}?name=${encodeURIComponent(s.name)}`
                )
              }
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
                <Ionicons name="book-outline" size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: c.text.primary }}>
                  {s.name}
                </Text>
                {s.description && (
                  <Text
                    style={{ fontSize: scale(13), color: c.text.secondary, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {s.description}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.text.tertiary} />
            </TouchableOpacity>
          ))}

          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary }}>
                Convite de Alunos
              </Text>
              <TouchableOpacity
                onPress={() => generateInvite.mutate()}
                disabled={generateInvite.isPending}
                accessibilityLabel="Gerar link de convite"
                accessibilityRole="button"
                style={{
                  backgroundColor: c.surfaceAlt,
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderColor: c.primaryLight,
                  opacity: generateInvite.isPending ? 0.6 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {generateInvite.isPending ? (
                  <ActivityIndicator size="small" color={c.primary} />
                ) : (
                  <>
                    <Ionicons name="link-outline" size={16} color={c.primary} />
                    <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.primary }}>
                      Gerar Link
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {inviteError && (
              <Text style={{ fontSize: scale(13), color: c.error, marginBottom: 8 }}>
                {inviteError}
              </Text>
            )}

            {activeInvite && (
              <View style={{
                backgroundColor: c.surfaceAlt,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: c.primaryLight,
                gap: 10,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="link" size={16} color={c.primary} />
                  <Text
                    style={{ fontSize: scale(13), color: c.text.secondary, flex: 1 }}
                    numberOfLines={1}
                  >
                    {activeInvite.inviteUrl}
                  </Text>
                </View>
                <Text style={{ fontSize: scale(12), color: c.text.tertiary }}>
                  Usado {activeInvite.useCount} vez{activeInvite.useCount !== 1 ? 'es' : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    onPress={handleShare}
                    accessibilityLabel="Compartilhar link de convite"
                    accessibilityRole="button"
                    style={{
                      flex: 1,
                      backgroundColor: c.primary,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Ionicons name="share-social-outline" size={16} color="#fff" />
                    <Text style={{ fontSize: scale(14), fontWeight: '600', color: '#fff' }}>
                      Compartilhar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => revokeInvite.mutate(activeInvite.id)}
                    disabled={revokeInvite.isPending}
                    accessibilityLabel="Revogar convite"
                    accessibilityRole="button"
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: c.error,
                      opacity: revokeInvite.isPending ? 0.6 : 1,
                    }}
                  >
                    {revokeInvite.isPending ? (
                      <ActivityIndicator size="small" color={c.error} />
                    ) : (
                      <Text style={{ fontSize: scale(14), fontWeight: '600', color: c.error }}>
                        Revogar
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!activeInvite && !generateInvite.isPending && !inviteError && (
              <View style={{
                backgroundColor: c.borderLight,
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
                gap: 6,
              }}>
                <Ionicons name="people-outline" size={28} color={c.text.tertiary} />
                <Text style={{ fontSize: scale(14), color: c.text.tertiary, textAlign: 'center' }}>
                  Gere um link para convidar alunos para esta turma
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: scale(18), fontWeight: '700', color: c.text.primary }}>
                Alunos Matriculados{!membersLoading ? ` (${students.length})` : ''}
              </Text>
            </View>

            {membersLoading && <ActivityIndicator color={c.primary} size="small" style={{ alignSelf: 'flex-start', marginLeft: 4 }} />}

            {!membersLoading && students.length === 0 && (
              <View style={{
                backgroundColor: c.borderLight,
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
                gap: 6,
              }}>
                <Ionicons name="people-outline" size={28} color={c.text.tertiary} />
                <Text style={{ fontSize: scale(14), color: c.text.tertiary, textAlign: 'center' }}>
                  Nenhum aluno matriculado ainda.
                </Text>
              </View>
            )}

            {!membersLoading && students.map((student) => (
              <View
                key={student.userId}
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: c.borderLight,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 8,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: c.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: scale(16), fontWeight: '700', color: c.primary }}>
                    {(student.displayName ?? 'A')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontSize: scale(15), fontWeight: '500', color: c.text.primary, flex: 1 }}>
                  {student.displayName ?? 'Aluno'}
                </Text>
              </View>
            ))}
          </View>
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
              Nova Matéria
            </Text>
            <View style={{ gap: 12 }}>
              <Input
                value={subjectName}
                onChangeText={setSubjectName}
                placeholder="Nome da matéria"
              />
              <Input
                value={subjectDesc}
                onChangeText={setSubjectDesc}
                placeholder="Descrição (opcional)"
                multiline
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setShowCreate(false)}
                disabled={createSubject.isPending}
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
                onPress={() => subjectName.trim() && createSubject.mutate()}
                disabled={createSubject.isPending || !subjectName.trim()}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: c.primary,
                  alignItems: 'center',
                  opacity: createSubject.isPending || !subjectName.trim() ? 0.6 : 1,
                }}
              >
                {createSubject.isPending ? (
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
