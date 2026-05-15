import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../lib/colors';
import { useActivityStore } from '../../../store/activity';
import { MOCK_STUDENT, MOCK_TEACHER } from '../../../lib/mock-data';
import { ActivityCard } from '../../../components/activity/ActivityCard';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Chip } from '../../../components/ui/Chip';
import { useAccessibilityStore } from '../../../store/accessibility';

export default function HomeScreen() {
  const router = useRouter();
  const { activities, selectedStudentId } = useActivityStore();
  const { fontSizeScale } = useAccessibilityStore();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const user = role === 'student' ? MOCK_STUDENT : MOCK_TEACHER;
  const subjects = [...new Set(activities.map((a) => a.subject))];
  const filteredActivities = selectedSubject
    ? activities.filter((a) => a.subject === selectedSubject)
    : activities;

  const openActivities = filteredActivities.filter((a) => a.status === 'open');
  const inProgressActivities = filteredActivities.filter(
    (a) => a.status === 'in_progress' || a.status === 'submitted'
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={`Olá, ${user.name.split(' ')[0]}!`}
        subtitle={role === 'student' ? 'Veja suas atividades' : 'Suas turmas e atividades'}
        rightAction={
          <TouchableOpacity
            onPress={() => setRole(role === 'student' ? 'teacher' : 'student')}
            accessibilityLabel={`Mudar para visão de ${role === 'student' ? 'professor' : 'aluno'}`}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>
              {role === 'student' ? '👩‍🏫 Professor' : '🎒 Aluno'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 100 }}>
          {role === 'teacher' && (
            <TouchableOpacity
              onPress={() => router.push('/(app)/create')}
              accessibilityLabel="Criar nova atividade"
              accessibilityRole="button"
              style={{
                backgroundColor: colors.primary,
                borderRadius: 20,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ gap: 4, flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 }}>
                  Criar Atividade
                </Text>
                <Text style={{ fontSize: 14, color: '#fff', opacity: 0.8 }}>
                  Defina um objetivo e escolha os formatos
                </Text>
              </View>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.2,
                }}
              >
                <Text style={{ fontSize: 22 }}>+</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>📚</Text>
              <Text style={{ fontSize: Math.round(16 * fontSizeScale), fontWeight: '700', color: colors.text.primary }}>
                {role === 'student' ? 'Suas Atividades' : 'Atividades da Turma'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.tertiary, fontWeight: '600' }}>
                ({filteredActivities.length})
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              <Chip
                label="Todas"
                color={colors.primary}
                selected={selectedSubject === null}
                onPress={() => setSelectedSubject(null)}
              />
              {subjects.map((subject) => (
                <Chip
                  key={subject}
                  label={subject}
                  color={colors.primary}
                  selected={selectedSubject === subject}
                  onPress={() => setSelectedSubject(subject)}
                />
              ))}
            </ScrollView>
          </View>

          {openActivities.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={{
                fontSize: Math.round(14 * fontSizeScale),
                fontWeight: '600',
                color: colors.text.secondary,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}>
                ⏳ Para fazer
              </Text>
              {openActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={(id) => router.push(`/(app)/activity/${id}`)}
                />
              ))}
            </View>
          )}

          {inProgressActivities.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={{
                fontSize: Math.round(14 * fontSizeScale),
                fontWeight: '600',
                color: colors.text.secondary,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}>
                📝 Em andamento
              </Text>
              {inProgressActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={(id) => router.push(`/(app)/activity/${id}`)}
                />
              ))}
            </View>
          )}

          {openActivities.length === 0 && inProgressActivities.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, textAlign: 'center' }}>
                Nenhuma atividade por enquanto
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center', maxWidth: 260 }}>
                Quando seu professor criar uma atividade, ela vai aparecer aqui!
              </Text>
            </View>
          )}

          <View style={{ marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => router.push('/(app)/accessibility')}
              accessibilityLabel="Abrir configurações de acessibilidade"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text style={{ fontSize: 22 }}>♿</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                  Acessibilidade
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                  Ajuste fonte, contraste e preferências
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}
