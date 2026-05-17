# Tasks: Trajeto do professor — criação e detalhe de atividade

## T1 — Fix new-activity: guard de subjectId + erro inline [REQ-1, REQ-2]
File: `apps/mobile/app/(app)/teacher/new-activity.tsx`
- Adicionar `if (!subjectId)` logo após `useLocalSearchParams` → renderizar tela de erro ("Parâmetro de navegação ausente — volte e tente novamente") com botão de voltar
- Adicionar estado `const [submitError, setSubmitError] = useState<string | null>(null)`
- No `onError` da mutation: `setSubmitError(err?.message ?? 'Não foi possível criar a atividade.')`; remover `Alert.alert` do `onError`
- No `onSuccess`: `setSubmitError(null)` (já navega de volta)
- Adicionar no footer, acima dos botões: `{submitError && <Text style={{ color: colors.error, ... }}>{submitError}</Text>}`
- Desabilitar o botão "Criar Atividade" quando `!subjectId || createActivity.isPending`
- Verificar: tsc --noEmit sem erros

## T2 — Nova tela: detalhe de atividade para professor [REQ-3]
File: `apps/mobile/app/(app)/teacher/activity/[id].tsx`
- `useLocalSearchParams` → `id`
- `useQuery(['activity', id])` → `apiFetch<ExamDetail>('/activities/${id}', { token: token! })`
- Header com back ("Atividades"), título da atividade
- Card de info: título, descrição, count de perguntas, data `createdAt` formatada
- Lista de perguntas: número, texto, badge "Discursiva" se `q.options.length === 0`, lista de opções se múltipla escolha
- Loading com `ActivityIndicator`; erro com estado vazio e botão de voltar
- Verificar: tsc --noEmit sem erros

## T3 — subject/[subjectId]: tornar cards navegáveis [REQ-4]
File: `apps/mobile/app/(app)/teacher/classroom/[id]/subject/[subjectId].tsx`
- Trocar o `View` externo de cada card de atividade por `TouchableOpacity`
- `onPress={() => router.push('/teacher/activity/${a.id}')}`
- Verificar: tsc --noEmit sem erros

## T4 — Verificação final
- `cd apps/mobile && npx tsc --noEmit` → 0 erros
- Testar fluxo: home → turma → matéria → nova atividade → preencher → criar → voltar → tocar no card → ver detalhe
