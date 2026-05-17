import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,

} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { colors } from '@/lib/colors';

// ─── Local form types ─────────────────────────────────────────────────────────

type LocalOption = { key: string; text: string; isCorrect: boolean };
type LocalQuestion = {
  key: string;
  text: string;
  isMultipleChoice: boolean;
  options: LocalOption[];
};

let _seq = 0;
function uid() {
  return String(++_seq);
}

function emptyQuestion(): LocalQuestion {
  return { key: uid(), text: '', isMultipleChoice: false, options: [] };
}

function emptyOption(): LocalOption {
  return { key: uid(), text: '', isCorrect: false };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({
  value,
  onChangeText,
  placeholder,
  multiline,
  required,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={`${placeholder}${required ? ' *' : ''}`}
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

function QuestionCard({
  question,
  index,
  onChangeText,
  onToggleType,
  onAddOption,
  onRemoveOption,
  onChangeOption,
  onMarkCorrect,
  onRemove,
  canRemove,
}: {
  question: LocalQuestion;
  index: number;
  onChangeText: (text: string) => void;
  onToggleType: () => void;
  onAddOption: () => void;
  onRemoveOption: (key: string) => void;
  onChangeOption: (key: string, text: string) => void;
  onMarkCorrect: (key: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
        gap: 12,
      }}
    >
      {/* Question header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Questão {index + 1}
        </Text>
        {canRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Question text */}
      <Field
        value={question.text}
        onChangeText={onChangeText}
        placeholder="Enunciado da questão"
        multiline
        required
      />

      {/* Type toggle */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => !question.isMultipleChoice || onToggleType()}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: !question.isMultipleChoice ? colors.primary : colors.surfaceAlt,
            borderWidth: 1,
            borderColor: !question.isMultipleChoice ? colors.primary : colors.borderLight,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: !question.isMultipleChoice ? colors.text.inverse : colors.text.secondary }}>
            Discursiva
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => question.isMultipleChoice || onToggleType()}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: question.isMultipleChoice ? colors.primary : colors.surfaceAlt,
            borderWidth: 1,
            borderColor: question.isMultipleChoice ? colors.primary : colors.borderLight,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: question.isMultipleChoice ? colors.text.inverse : colors.text.secondary }}>
            Múltipla escolha
          </Text>
        </TouchableOpacity>
      </View>

      {/* Options (multiple choice only) */}
      {question.isMultipleChoice && (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
            Toque no círculo para marcar a resposta correta.
          </Text>

          {question.options.map((opt, i) => (
            <View
              key={opt.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: opt.isCorrect ? colors.primary + '10' : colors.surfaceAlt,
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: opt.isCorrect ? colors.primary + '40' : 'transparent',
              }}
            >
              {/* Correct radio */}
              <TouchableOpacity onPress={() => onMarkCorrect(opt.key)} hitSlop={8}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: opt.isCorrect ? colors.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {opt.isCorrect && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {/* Option text */}
              <TextInput
                value={opt.text}
                onChangeText={(t) => onChangeOption(opt.key, t)}
                placeholder={`Opção ${i + 1}`}
                placeholderTextColor={colors.text.tertiary}
                style={{ flex: 1, fontSize: 15, color: colors.text.primary, padding: 0 }}
              />

              {/* Remove option */}
              <TouchableOpacity onPress={() => onRemoveOption(opt.key)} hitSlop={8}>
                <Ionicons name="close-circle-outline" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={onAddOption}
            style={{
              borderWidth: 1.5,
              borderColor: colors.primaryLight,
              borderStyle: 'dashed',
              borderRadius: 12,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
              + Adicionar opção
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(title: string, questions: LocalQuestion[]): string | null {
  if (!title.trim()) return 'Informe o título da atividade.';
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const n = i + 1;
    if (!q.text.trim()) return `Questão ${n}: informe o enunciado.`;
    if (q.isMultipleChoice) {
      if (q.options.length < 2) return `Questão ${n}: adicione pelo menos 2 opções.`;
      if (q.options.some((o) => !o.text.trim())) return `Questão ${n}: preencha o texto de todas as opções.`;
      if (q.options.filter((o) => o.isCorrect).length !== 1)
        return `Questão ${n}: marque exatamente 1 opção correta.`;
    }
  }
  return null;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function NewActivityScreen() {
  const { subjectId, classroomId, name } = useLocalSearchParams<{ subjectId: string; classroomId: string; name: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  function goBack() {
    router.replace(`/teacher/classroom/${classroomId}/subject/${subjectId}?name=${encodeURIComponent(name ?? '')}`);
  }

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [questions, setQuestions] = useState<LocalQuestion[]>([emptyQuestion()]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Question mutations ────────────────────────────────────────────────────

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }, []);

  const removeQuestion = useCallback((key: string) => {
    setQuestions((prev) => prev.filter((q) => q.key !== key));
  }, []);

  const updateQuestion = useCallback((key: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, text } : q)));
  }, []);

  const toggleType = useCallback((key: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key
          ? { ...q, isMultipleChoice: !q.isMultipleChoice, options: q.isMultipleChoice ? [] : [emptyOption(), emptyOption()] }
          : q
      )
    );
  }, []);

  const addOption = useCallback((qKey: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.key === qKey ? { ...q, options: [...q.options, emptyOption()] } : q))
    );
  }, []);

  const removeOption = useCallback((qKey: string, oKey: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === qKey ? { ...q, options: q.options.filter((o) => o.key !== oKey) } : q
      )
    );
  }, []);

  const updateOption = useCallback((qKey: string, oKey: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === qKey
          ? { ...q, options: q.options.map((o) => (o.key === oKey ? { ...o, text } : o)) }
          : q
      )
    );
  }, []);

  const markCorrect = useCallback((qKey: string, oKey: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === qKey
          ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.key === oKey })) }
          : q
      )
    );
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const createActivity = useMutation({
    mutationFn: () => {
      const body = {
        title: title.trim(),
        description: desc.trim() || undefined,
        questions: questions.map((q, i) => ({
          orderIndex: i,
          text: q.text.trim(),
          options: q.isMultipleChoice
            ? q.options.map((o, j) => ({ orderIndex: j, text: o.text.trim(), isCorrect: o.isCorrect }))
            : undefined,
        })),
      };
      return apiFetch(`/subjects/${subjectId}/activities`, { method: 'POST', token: token!, body });
    },
    onSuccess: () => {
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['activities', subjectId] });
      goBack();
    },
    onError: (err: any) => {
      setSubmitError(err?.message ?? 'Não foi possível criar a atividade.');
    },
  });

  function handleSubmit() {
    setSubmitError(null);
    const error = validate(title, questions);
    if (error) {
      setSubmitError(error);
      return;
    }
    createActivity.mutate();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!subjectId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 }}>
          Erro de navegação
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginBottom: 24 }}>
          Parâmetro de matéria ausente. Volte e tente novamente.
        </Text>
        <TouchableOpacity onPress={() => goBack()} style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.inverse }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          onPress={() => goBack()}
          style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '500' }}>
            {decodeURIComponent(name ?? 'Matéria')}
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
          Nova Atividade
        </Text>
      </View>

      {/* Form */}
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title + Description */}
        <View style={{ gap: 12 }}>
          <Field value={title} onChangeText={setTitle} placeholder="Título da atividade" required />
          <Field value={desc} onChangeText={setDesc} placeholder="Descrição (opcional)" multiline />
        </View>

        {/* Questions */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
            Questões
          </Text>

          {questions.map((q, i) => (
            <QuestionCard
              key={q.key}
              question={q}
              index={i}
              onChangeText={(t) => updateQuestion(q.key, t)}
              onToggleType={() => toggleType(q.key)}
              onAddOption={() => addOption(q.key)}
              onRemoveOption={(oKey) => removeOption(q.key, oKey)}
              onChangeOption={(oKey, t) => updateOption(q.key, oKey, t)}
              onMarkCorrect={(oKey) => markCorrect(q.key, oKey)}
              onRemove={() => removeQuestion(q.key)}
              canRemove={questions.length > 1}
            />
          ))}

          <TouchableOpacity
            onPress={addQuestion}
            style={{
              borderWidth: 1.5,
              borderColor: colors.primaryLight,
              borderStyle: 'dashed',
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600' }}>
              + Adicionar questão
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          padding: 20,
          paddingBottom: 32,
          gap: 10,
        }}
      >
        {submitError && (
          <Text style={{ fontSize: 13, color: colors.error, textAlign: 'center' }}>
            {submitError}
          </Text>
        )}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => goBack()}
            disabled={createActivity.isPending}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 14,
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
            onPress={handleSubmit}
            disabled={createActivity.isPending}
            style={{
              flex: 2,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: colors.primary,
              alignItems: 'center',
              opacity: createActivity.isPending ? 0.7 : 1,
            }}
          >
            {createActivity.isPending ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.inverse }}>
                Criar Atividade
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
