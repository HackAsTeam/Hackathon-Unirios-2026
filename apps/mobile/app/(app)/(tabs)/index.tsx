import { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth';
import { useOnboardingStore } from '../../../store/onboarding';
import { Header } from '@/components/ui/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardHeader } from '@/components/ui/Card';
import { colors } from '@/lib/colors';
import { apiFetch } from '../../../lib/api';
import type { Classroom, Subject, Exam } from '../../../types/classroom';

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useClassrooms(token: string | null) {
  return useQuery({
    queryKey: ['classrooms'],
    queryFn: () => apiFetch<Classroom[]>('/classrooms', { token: token! }),
    enabled: !!token,
  });
}

function useClassroomExams(classroomId: string | null, token: string | null) {
  return useQuery({
    queryKey: ['exams', classroomId],
    queryFn: () => apiFetch<Exam[]>(`/exams/classroom/${classroomId}`, { token: token! }),
    enabled: !!classroomId && !!token,
  });
}

// ─── Shared components ───────────────────────────────────────────────────────

function Input({ value, onChangeText, placeholder, multiline }: {
  value: string; onChangeText: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  return (
    <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline}
      placeholderTextColor={colors.text.tertiary}
      style={{
        borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16,
        color: colors.text.primary, backgroundColor: colors.surface,
        minHeight: multiline ? 80 : undefined, textAlignVertical: multiline ? 'top' : undefined,
      }}
    />
  );
}

function Breadcrumb({ steps }: { steps: { label: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
      {steps.map((step, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {i > 0 && <Text style={{ fontSize: 14, color: colors.text.tertiary }}>{'›'}</Text>}
          <Text style={{ fontSize: 13, color: i === steps.length - 1 ? colors.primary : colors.text.tertiary, fontWeight: i === steps.length - 1 ? '600' : '400' }} numberOfLines={1}>
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function Overlay({ visible, onPress, children }: { visible: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPress}>
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 24 }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onPress} />
        {children}
        <TouchableOpacity style={{ flex: 1 }} onPress={onPress} />
      </View>
    </Modal>
  );
}

function CreateModal({ visible, onClose, title, onSubmit, loading, breadcrumb, children }: {
  visible: boolean; onClose: () => void; title: string;
  onSubmit: () => void; loading: boolean;
  breadcrumb?: { label: string }[]; children: React.ReactNode;
}) {
  return (
    <Overlay visible={visible} onPress={onClose}>
      <View style={{ backgroundColor: colors.background, borderRadius: 24, padding: 24, maxHeight: '80%' }}>
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          {breadcrumb && <Breadcrumb steps={breadcrumb} />}
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 16 }}>{title}</Text>
          <View style={{ gap: 12 }}>{children}</View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity onPress={onClose} disabled={loading}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.secondary }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSubmit} disabled={loading}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
              {loading ? <ActivityIndicator color={colors.text.inverse} size="small" /> : <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.inverse }}>Criar</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Overlay>
  );
}

function ClassroomPicker({ visible, onClose, onSelect, title, classrooms }: {
  visible: boolean; onClose: () => void; onSelect: (c: Classroom) => void;
  title: string; classrooms: Classroom[];
}) {
  return (
    <Overlay visible={visible} onPress={onClose}>
      <View style={{ backgroundColor: colors.background, borderRadius: 24, padding: 24, maxHeight: '70%' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 16 }}>{title}</Text>
        <ScrollView style={{ maxHeight: 400 }} bounces={false}>
          <View style={{ gap: 8 }}>
            {classrooms.map((c) => (
              <TouchableOpacity key={c.id} onPress={() => onSelect(c)}
                style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.borderLight }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>{c.title}</Text>
                {c.description && <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}>{c.description}</Text>}
                <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>{c.subjects.length} matéria{c.subjects.length !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={{ marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.secondary }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Overlay>
  );
}

function SubjectPicker({ visible, classroom, onClose, onSelect }: {
  visible: boolean; classroom: Classroom | null;
  onClose: () => void; onSelect: (s: Subject) => void;
}) {
  return (
    <Overlay visible={visible} onPress={onClose}>
      <View style={{ backgroundColor: colors.background, borderRadius: 24, padding: 24, maxHeight: '70%' }}>
        <Breadcrumb steps={[{ label: classroom?.title ?? '' }]} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginVertical: 16 }}>Selecione a matéria</Text>
        <ScrollView style={{ maxHeight: 400 }} bounces={false}>
          <View style={{ gap: 8 }}>
            {classroom?.subjects.map((s) => (
              <TouchableOpacity key={s.id} onPress={() => onSelect(s)}
                style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.borderLight }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>{s.name}</Text>
                {s.description && <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}>{s.description}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={{ marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.secondary }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </Overlay>
  );
}

// ─── Classroom Card ──────────────────────────────────────────────────────────

function ClassroomCard({ classroom, expanded, selectedSubjectId, onToggle, onSelectSubject, onCreateSubject, onCreateExam }: {
  classroom: Classroom; expanded: boolean; selectedSubjectId: string | null;
  onToggle: () => void; onSelectSubject: (subjectId: string | null) => void;
  onCreateSubject: (c: Classroom) => void; onCreateExam: (c: Classroom) => void;
}) {
  const token = useAuthStore((s) => s.token);
  const { data: exams, isLoading: examsLoading } = useClassroomExams(expanded ? classroom.id : null, token);
  const hasSubjects = classroom.subjects.length > 0;

  return (
    <Card variant="elevated" onPress={onToggle}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <CardHeader title={classroom.title} subtitle={
            classroom.description ?? `${classroom.subjects.length} matéria${classroom.subjects.length !== 1 ? 's' : ''}`
          } />
        </View>
        <Text style={{ fontSize: 18, color: colors.text.tertiary }}>{expanded ? '▾' : '▸'}</Text>
      </View>

      {expanded && (
        <View style={{ marginTop: 12, gap: 8 }}>
          {!hasSubjects && (
            <TouchableOpacity onPress={() => onCreateSubject(classroom)}
              style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600' }}>+ Criar matéria</Text>
            </TouchableOpacity>
          )}

          {hasSubjects && (
            <>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
                Matérias
              </Text>
              {classroom.subjects.map((s) => {
                const isSelected = selectedSubjectId === s.id;
                return (
                  <TouchableOpacity key={s.id} onPress={() => onSelectSubject(isSelected ? null : s.id)}
                    style={{
                      backgroundColor: isSelected ? colors.primaryLight + '20' : colors.surfaceAlt,
                      borderRadius: 12, padding: 14, borderWidth: 1,
                      borderColor: isSelected ? colors.primaryLight : 'transparent',
                    }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>{s.name}</Text>
                    {s.description && <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}>{s.description}</Text>}
                    {isSelected && (
                      <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4 }}>Toque para recolher</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={() => onCreateSubject(classroom)}
                style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.primaryLight, borderStyle: 'dashed' }}>
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>+ Nova matéria</Text>
              </TouchableOpacity>
            </>
          )}

          {examsLoading && <ActivityIndicator size="small" color={colors.primary} style={{ padding: 8 }} />}

          {exams && exams.length > 0 && (
            <>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>
                Atividades
              </Text>
              {exams.map((e) => (
                <View key={e.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.borderLight, marginLeft: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>{e.title}</Text>
                  {e.description && <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}>{e.description}</Text>}
                  <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>{e.questionCount} pergunta{e.questionCount !== 1 ? 's' : ''}</Text>
                </View>
              ))}
            </>
          )}

          {exams && exams.length === 0 && hasSubjects && (
            <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: 'center', padding: 8 }}>
              Nenhuma atividade ainda
            </Text>
          )}

          {hasSubjects && (
            <TouchableOpacity onPress={() => onCreateExam(classroom)}
              style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.primaryLight, borderStyle: 'dashed' }}>
              <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600' }}>+ Nova atividade</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const displayName = useAuthStore((s) => s.displayName);
  const role = useOnboardingStore((s) => s.role);
  const isTeacher = role === 'teacher';
  const roleLabel = isTeacher ? 'Professor' : 'Aluno';
  const subtitle = isTeacher ? 'Gerencie suas turmas' : 'Veja suas atividades';

  const { data: classrooms, isLoading } = useClassrooms(token);

  // ── UI state ───────────────────────────────────────────────────────────────

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Classroom creation
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);

  // Inline create subject (from card)
  const [createTarget, setCreateTarget] = useState<Classroom | null>(null);
  const [showCreateSubject, setShowCreateSubject] = useState(false);

  // Inline create exam (from card)
  const [showCreateExam, setShowCreateExam] = useState(false);

  // Classroom picker (banner CTA)
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'subject' | 'exam'>('subject');

  // Subject picker (exam flow)
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [pickedSubject, setPickedSubject] = useState<Subject | null>(null);

  // Form state
  const [classroomTitle, setClassroomTitle] = useState('');
  const [classroomDesc, setClassroomDesc] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createClassroom = useMutation({
    mutationFn: () => apiFetch('/classrooms', { method: 'POST', token: token!, body: { title: classroomTitle, description: classroomDesc || undefined } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classrooms'] }); setShowCreateClassroom(false); setClassroomTitle(''); setClassroomDesc(''); },
  });

  const createSubject = useMutation({
    mutationFn: () => apiFetch(`/classrooms/${createTarget!.id}/subjects`, { method: 'POST', token: token!, body: { name: subjectName, description: subjectDesc || undefined } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classrooms'] }); setShowCreateSubject(false); setSubjectName(''); setSubjectDesc(''); },
  });

  const createExam = useMutation({
    mutationFn: () => apiFetch('/exams', { method: 'POST', token: token!, body: { classroomId: createTarget!.id, title: examTitle, description: examDesc || undefined, questions: [{ orderIndex: 0, text: 'Pergunta padrão' }] } }),
    onSuccess: () => { setShowCreateExam(false); setExamTitle(''); setExamDesc(''); setPickedSubject(null); setCreateTarget(null); queryClient.invalidateQueries({ queryKey: ['classrooms'] }); },
  });

  // For the exam flow: create subject, then wait for refetch, then show subject picker
  const createSubjectForExam = useMutation({
    mutationFn: () => apiFetch(`/classrooms/${createTarget!.id}/subjects`, { method: 'POST', token: token!, body: { name: subjectName, description: subjectDesc || undefined } }),
    onSuccess: async () => {
      setShowCreateSubject(false);
      setSubjectName('');
      setSubjectDesc('');
      await queryClient.refetchQueries({ queryKey: ['classrooms'] });
      setShowSubjectPicker(true);
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  function openPicker(mode: 'subject' | 'exam') {
    setPickerMode(mode);
    setShowPicker(true);
  }

  function handlePickerSelect(c: Classroom) {
    setShowPicker(false);
    setCreateTarget(c);

    if (pickerMode === 'subject') {
      setShowCreateSubject(true);
    } else {
      if (c.subjects.length > 0) {
        setShowSubjectPicker(true);
      } else {
        setShowCreateSubject(true);
      }
    }
  }

  function handleSubjectSelect(s: Subject) {
    setPickedSubject(s);
    setShowSubjectPicker(false);
    setShowCreateExam(true);
  }

  function openCreateSubject(c: Classroom) {
    setCreateTarget(c);
    setShowCreateSubject(true);
  }

  function openCreateExam(c: Classroom) {
    setCreateTarget(c);
    setPickedSubject(null);
    setShowCreateExam(true);
  }

  function handleSubjectTap(subjectId: string | null) {
    setSelectedSubjectId(subjectId);
  }

  function closeCreateSubject() {
    setShowCreateSubject(false);
    setCreateTarget(null);
    setPickedSubject(null);
  }

  function closeCreateExam() {
    setShowCreateExam(false);
    setCreateTarget(null);
    setPickedSubject(null);
  }

  function closeSubjectPicker() {
    setShowSubjectPicker(false);
    setCreateTarget(null);
  }

  // ── Student view ──────────────────────────────────────────────────────────

  if (!isTeacher) {
    return (
      <View className="flex-1 bg-white">
        <Header title={`Olá, ${displayName ?? 'Usuário'}!`} subtitle={subtitle} rightAction={roleBadge(roleLabel)} />
      </View>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Header title={`Olá, ${displayName ?? 'Usuário'}!`} subtitle={subtitle} rightAction={roleBadge(roleLabel)} />
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
    );
  }

  // ── No classrooms ──────────────────────────────────────────────────────────

  if (!classrooms || classrooms.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <Header title={`Olá, ${displayName ?? 'Usuário'}!`} subtitle={subtitle} rightAction={roleBadge(roleLabel)} />
        <EmptyState icon="🏫" title="Vamos criar uma turma?" message="Crie sua primeira turma para começar a adicionar matérias e atividades." actionLabel="Criar Turma" onAction={() => setShowCreateClassroom(true)} />
        <CreateModal visible={showCreateClassroom} onClose={() => setShowCreateClassroom(false)} title="Nova Turma" onSubmit={() => classroomTitle.trim() && createClassroom.mutate()} loading={createClassroom.isPending}>
          <Input value={classroomTitle} onChangeText={setClassroomTitle} placeholder="Nome da turma" />
          <Input value={classroomDesc} onChangeText={setClassroomDesc} placeholder="Descrição (opcional)" multiline />
        </CreateModal>
      </View>
    );
  }

  const hasAnySubjects = classrooms.some((c) => c.subjects.length > 0);

  // ── Classrooms list ────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-white">
      <Header title={`Olá, ${displayName ?? 'Usuário'}!`} subtitle={subtitle} rightAction={roleBadge(roleLabel)} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, gap: 12 }}>
        {!hasAnySubjects ? (
          <TouchableOpacity onPress={() => openPicker('subject')}
            style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>Vamos criar uma matéria?</Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>As matérias organizam as atividades da sua turma. Selecione uma turma para criar a primeira matéria.</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary, marginTop: 4 }}>Escolher turma {'→'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => openPicker('exam')}
            style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>Vamos criar uma atividade?</Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>Crie atividades com diferentes formatos de resposta para seus alunos.</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary, marginTop: 4 }}>Escolher turma {'→'}</Text>
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>Suas Turmas</Text>
          <TouchableOpacity onPress={() => setShowCreateClassroom(true)}
            style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.primaryLight }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>+ Nova Turma</Text>
          </TouchableOpacity>
        </View>

        {classrooms.map((c) => (
          <ClassroomCard
            key={c.id} classroom={c}
            expanded={expandedId === c.id}
            selectedSubjectId={selectedSubjectId}
            onToggle={() => {
              setExpandedId(expandedId === c.id ? null : c.id);
              setSelectedSubjectId(null);
            }}
            onSelectSubject={handleSubjectTap}
            onCreateSubject={openCreateSubject}
            onCreateExam={openCreateExam}
          />
        ))}
      </ScrollView>

      {/* ── Classroom picker ─────────────────────────────────────────── */}

      <ClassroomPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickerSelect}
        title={pickerMode === 'subject' ? 'Selecione a turma para criar matéria' : 'Selecione a turma para criar atividade'}
        classrooms={classrooms}
      />

      {/* ── Subject picker (exam flow) ────────────────────────────────── */}

      <SubjectPicker
        visible={showSubjectPicker}
        classroom={createTarget}
        onClose={closeSubjectPicker}
        onSelect={handleSubjectSelect}
      />

      {/* ── Create Classroom ─────────────────────────────────────────── */}

      <CreateModal visible={showCreateClassroom} onClose={() => setShowCreateClassroom(false)} title="Nova Turma" onSubmit={() => classroomTitle.trim() && createClassroom.mutate()} loading={createClassroom.isPending}>
        <Input value={classroomTitle} onChangeText={setClassroomTitle} placeholder="Nome da turma" />
        <Input value={classroomDesc} onChangeText={setClassroomDesc} placeholder="Descrição (opcional)" multiline />
      </CreateModal>

      {/* ── Create Subject (inline / picker) ─────────────────────────── */}

      <CreateModal visible={showCreateSubject} onClose={closeCreateSubject} title="Nova Matéria"
        onSubmit={() => subjectName.trim() && (pickerMode === 'exam' ? createSubjectForExam : createSubject).mutate()}
        loading={(pickerMode === 'exam' ? createSubjectForExam : createSubject).isPending}
        breadcrumb={createTarget ? [{ label: createTarget.title }] : undefined}>
        <Input value={subjectName} onChangeText={setSubjectName} placeholder="Nome da matéria" />
        <Input value={subjectDesc} onChangeText={setSubjectDesc} placeholder="Descrição (opcional)" multiline />
      </CreateModal>

      {/* ── Create Exam ──────────────────────────────────────────────── */}

      <CreateModal visible={showCreateExam} onClose={closeCreateExam} title="Nova Atividade"
        onSubmit={() => examTitle.trim() && createExam.mutate()}
        loading={createExam.isPending}
        breadcrumb={
          createTarget
            ? pickedSubject
              ? [{ label: createTarget.title }, { label: pickedSubject.name }, { label: 'Atividade' }]
              : [{ label: createTarget.title }, { label: 'Atividade' }]
            : undefined
        }>
        <Input value={examTitle} onChangeText={setExamTitle} placeholder="Título da atividade" />
        <Input value={examDesc} onChangeText={setExamDesc} placeholder="Descrição (opcional)" multiline />
      </CreateModal>
    </View>
  );
}

function roleBadge(label: string) {
  return (
    <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.borderLight }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>{label}</Text>
    </View>
  );
}
