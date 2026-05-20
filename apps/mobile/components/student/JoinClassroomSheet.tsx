import { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useColors } from '../../hooks/useColors';
import { useScale } from '../../hooks/useScale';
import { apiFetch } from '../../lib/api';

function extractToken(input: string): string {
  const match = input.match(/\/i\/([^/?#\s]+)/);
  return match ? match[1] : input.trim();
}

interface JoinClassroomSheetProps {
  visible: boolean;
  onClose: () => void;
  onJoined?: (classroomTitle: string) => void;
}

export function JoinClassroomSheet({ visible, onClose, onJoined }: JoinClassroomSheetProps) {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const c = useColors();
  const scale = useScale();

  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const joinClassroom = useMutation({
    mutationFn: (inviteToken: string) =>
      apiFetch<{ classroomId: string; classroomTitle: string; studentId: string; joinedAt: string }>(
        '/invitations/join',
        { method: 'POST', token: token!, body: { token: inviteToken } }
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['student-activity-statuses'] });
      setJoinInput('');
      setJoinError(null);
      onJoined?.(data.classroomTitle);
      onClose();
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

  function handleClose() {
    setJoinInput('');
    setJoinError(null);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} />
        <View
          style={{
            backgroundColor: c.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 36,
            gap: 16,
          }}
        >
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
            onChangeText={(v) => {
              setJoinInput(v);
              setJoinError(null);
            }}
            placeholder="https://... ou código do convite"
            placeholderTextColor={c.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
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
              onPress={handleClose}
              disabled={joinClassroom.isPending}
              accessibilityLabel="Cancelar ingresso"
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
              onPress={handleJoinConfirm}
              disabled={joinClassroom.isPending || !joinInput.trim()}
              accessibilityLabel="Confirmar ingresso em turma"
              accessibilityRole="button"
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
  );
}
