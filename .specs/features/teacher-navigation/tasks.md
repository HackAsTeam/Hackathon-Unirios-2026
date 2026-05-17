# Tasks: Navegação aninhada do professor

## T1 — Backend: fix question validation (REQ-5)
File: `src/HackathonUnirios2026.Application/Features/Exams/Commands/CreateExamCommandHandler.cs`
Change `if (question.Options.Count < 2)` to `if (question.Options.Count > 0 && question.Options.Count < 2)`.
Verify: backend builds, `dotnet build HackathonUnirios2026.sln`

## T2 — Expo Router: register new stack routes (REQ-7)
File: `apps/mobile/app/(app)/_layout.tsx`
Add `<Stack.Screen name="teacher/classroom/[id]" />` and `<Stack.Screen name="teacher/classroom/[id]/subject/[subjectId]" />`.

## T3 — New page: classroom detail (REQ-2)
File: `apps/mobile/app/(app)/teacher/classroom/[id].tsx`
- `useLocalSearchParams` → `id`
- `useQuery(['classroom', id])` → `GET /classrooms` then find by id OR `GET /classrooms/{id}` if the endpoint exists (it does: returns `ClassroomDetailResponse`)
- Show header with back button (via Stack navigation), title, description
- Subjects list; empty state with "Criar Matéria"
- Inline create subject modal (title + description)
- `useMutation` → `POST /classrooms/{id}/subjects`; on success invalidate `['classrooms']` and refetch detail
- Each subject card: `router.push('/teacher/classroom/${id}/subject/${s.id}')`

## T4 — New page: subject detail (REQ-3)
File: `apps/mobile/app/(app)/teacher/classroom/[id]/subject/[subjectId].tsx`
- Params: `id` (classroomId), `subjectId`
- `useQuery(['activities', subjectId])` → `GET /subjects/{subjectId}/activities`
- Show header with subject name, activity list
- Empty state + "Criar Atividade"
- Inline create activity modal (title + description fields only)
- `useMutation` → `POST /subjects/{subjectId}/activities` with body `{ subjectId, title, description?, questions: [{ orderIndex: 0, text: 'Pergunta padrão' }] }`; on success invalidate `['activities', subjectId]`

## T5 — Simplify teacher home (REQ-1 + REQ-6)
File: `apps/mobile/app/(app)/(tabs)/index.tsx`
- Remove: `ClassroomCard`, `ClassroomPicker`, `SubjectPicker`, `createExam`, `createSubjectForExam`, `useClassroomExams`
- Remove state: `expandedId`, `selectedSubjectId`, `showCreateExam`, `showPicker`, `pickerMode`, `showSubjectPicker`, `pickedSubject`, `subjectName`, `subjectDesc`, `examTitle`, `examDesc`, `createTarget` (partial — keep for classroom creation)
- Keep: `useClassrooms`, classroom creation modal and mutation, `Input`, `Breadcrumb`, `CreateModal`
- New `TeacherClassroomCard`: simple card showing title + subject count; `onPress` → `router.push('/teacher/classroom/${c.id}')`
- The "Vamos criar uma matéria?" / "Vamos criar uma atividade?" banner is removed; replaced with a single "+ Nova Turma" button in the header area

## T6 — Types: add `SubjectDetail` and `ActivityResponse` if needed
File: `apps/mobile/types/classroom.ts`
Verify existing `Subject` and `Exam` types cover what's needed; add `ActivityListItem` alias if the activities endpoint returns a different shape (it returns `ExamResponse` — already covered by `Exam` type).

## T7 — Verify TypeScript compiles
Run `cd apps/mobile && npx tsc --noEmit` and fix any errors.
