# Spec: Navegação aninhada do professor

## Context

The current teacher home (`(tabs)/index.tsx`) crams classroom management, subject management, and exam creation into a single accordion view with a cascade of modals and pickers. This is confusing and exam creation is broken in two ways:

1. The mutation POSTs to `/exams` with `classroomId` in the body, but the correct endpoint is `POST /subjects/{subjectId}/activities` (which takes `subjectId` in the URL, not the body).
2. The questions array `[{ orderIndex: 0, text: 'Pergunta padrão' }]` has no `options`, and the backend handler currently rejects any question with fewer than 2 options regardless of type.

## Goal

Replace the flat accordion + modal stack with proper nested navigation: **Turmas → Matérias → Atividades**. Each level gets its own screen. Exam creation is fixed to hit the correct endpoint with valid data.

---

## Requirements

### REQ-1 — Simplified teacher home (classrooms list only)
The teacher tab home shows only the list of classrooms and a "Nova Turma" button. No accordion expansion, no subject or exam creation modals here. Tapping a classroom card navigates to the classroom detail page.

### REQ-2 — Classroom detail page
Route: `/teacher/classroom/[id]`

Shows:
- Classroom title and description in a header
- Back navigation (Expo Stack back button)
- List of subjects (from `classroom.subjects` already included in `GET /classrooms` response)
- Empty state with "Criar Matéria" CTA when no subjects exist
- Inline "Nova Matéria" modal (title + optional description)
- Each subject card navigates to the subject detail page

### REQ-3 — Subject detail page
Route: `/teacher/classroom/[id]/subject/[subjectId]`

Shows:
- Subject name in a header
- Back navigation
- List of activities fetched from `GET /subjects/{subjectId}/activities`
- Empty state with "Criar Atividade" CTA
- Inline "Nova Atividade" modal (title + optional description + one default discursive question)
- Each activity card is display-only (title, description, question count)

### REQ-4 — Activity creation (fixed)
The create mutation must:
- POST to `/subjects/{subjectId}/activities` (uses subjectId from route params)
- Send body `{ subjectId, title, description?, questions: [{ orderIndex: 0, text: 'Pergunta padrão' }] }` — **no options** (discursive by default)

### REQ-5 — Backend fix: allow discursive questions
`CreateExamCommandHandler` must allow questions with zero options. The validation `question.Options.Count < 2` should only apply when `question.Options` is non-empty (i.e., multiple-choice requires ≥ 2 options; zero options = discursive, always valid).

### REQ-6 — Remove broken code from index.tsx
Remove from `HomeScreen`:
- `createExam` mutation (wrong endpoint + wrong body)
- `createSubjectForExam` mutation (no longer needed)
- `ClassroomCard`, `ClassroomPicker`, `SubjectPicker` components
- All related state variables and handlers
- `useClassroomExams` hook

Keep: `useClassrooms`, `CreateModal`, `Input`, `Breadcrumb` helpers (still used for "Nova Turma" inline form), `ClassroomCard` replaced by a simpler tap-to-navigate card.

### REQ-7 — Stack layout for new routes
`(app)/_layout.tsx` must register the new routes (`teacher/classroom/[id]` and `teacher/classroom/[id]/subject/[subjectId]`) so Expo Router's Stack navigator handles them.

---

## API surface used

| Operation | Endpoint |
|-----------|----------|
| List classrooms | `GET /classrooms` |
| List subjects | subjects are embedded in `ClassroomResponse.subjects` |
| Create subject | `POST /classrooms/{classroomId}/subjects` |
| List activities | `GET /subjects/{subjectId}/activities` |
| Create activity | `POST /subjects/{subjectId}/activities` |

---

## Out of scope

- Editing or deleting classrooms/subjects/activities
- Activity detail page for teacher (view student answers / grade)
- Question builder UI (activity always created with one default discursive question)
