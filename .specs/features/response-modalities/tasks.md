# Tasks: Sistema de Modalidades de Resposta

## T1 — Instalar expo-av e adicionar permissões [REQ-4.1, REQ-5.1]
- `expo install expo-av` no apps/mobile
- Adicionar plugin expo-av no app.json
- Status: pending

## T2 — Tipos: ExamDetail, AttemptResponse [REQ-3, REQ-4.7]
- Estender types/classroom.ts com ExamDetail, QuestionItem
- Adicionar types/attempt.ts com AttemptResponse
- Status: pending

## T3 — Home do Aluno: listagem de turmas e exames [REQ-2]
- Criar StudentHomeScreen dentro de index.tsx
- Accordion por turma, lista de exames por turma
- Status: pending

## T4 — Tela de Detalhe da Atividade [REQ-3]
- `app/(app)/activity/[id].tsx`
- Perguntas do exame + botão Responder
- Status: pending

## T5 — Seleção de Formato (tela full-screen) [REQ-1]
- `app/(app)/activity/[id]/choose.tsx`
- Cards animados (Reanimated spring + press scale)
- Status: pending

## T6 — Resposta em Áudio [REQ-4]
- `app/(app)/respond/[id]/audio.tsx`
- WaveformVisualizer component
- expo-av Recording + Playback
- Status: pending

## T7 — Resposta Oral com Transcrição [REQ-5]
- `app/(app)/respond/[id]/oral.tsx`
- Animação de "ouvindo", texto progressivo, edição
- Status: pending

## T8 — Resposta em Texto [REQ-6]
- `app/(app)/respond/[id]/text.tsx`
- TextInput adaptado com fontSizeScale
- Status: pending

## T9 — Painel de Acessibilidade [REQ-7]
- `components/accessibility/AccessibilityPanel.tsx`
- Botão flutuante + bottom sheet
- Status: pending

## T10 — Atualizar router.d.ts com novas rotas
- /activity/[id], /activity/[id]/choose
- /respond/[id]/audio, /respond/[id]/oral, /respond/[id]/text
- Status: pending
