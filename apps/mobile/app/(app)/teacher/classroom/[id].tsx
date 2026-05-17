import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { colors } from '@/lib/colors';
import type { Classroom } from '@/types/classroom';

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

  const { data: classroom, isLoading } = useQuery({
    queryKey: ['classroom', id],
    queryFn: () => apiFetch<Classroom>(`/classrooms/${id}`, { token: token! }),
    enabled: !!id && !!token,
  });

  const [showCreate, setShowCreate] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');

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
          onPress={() => router.replace('/')}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '500' }}>Turmas</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
              {classroom?.title}
            </Text>
            {classroom?.description && (
              <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
                {classroom.description}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>
              Matérias
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: colors.primaryLight,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                + Nova Matéria
              </Text>
            </TouchableOpacity>
          </View>

          {(!classroom?.subjects || classroom.subjects.length === 0) && (
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
              <Text style={{ fontSize: 32 }}>📚</Text>
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 4 }}
              >
                Nenhuma matéria ainda
              </Text>
              <Text
                style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}
              >
                Crie a primeira matéria para organizar as atividades desta turma.
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{
                  marginTop: 8,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.inverse }}>
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
                <Ionicons name="book-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                  {s.name}
                </Text>
                {s.description && (
                  <Text
                    style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {s.description}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create subject modal */}
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
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.secondary }}>
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
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  opacity: createSubject.isPending || !subjectName.trim() ? 0.6 : 1,
                }}
              >
                {createSubject.isPending ? (
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
