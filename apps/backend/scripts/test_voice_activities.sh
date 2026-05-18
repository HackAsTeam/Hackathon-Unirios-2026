#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:5099"
R=$RANDOM  # unique suffix so repeated runs don't collide

fail() { echo "❌ FAIL: $1"; exit 1; }
step() { echo; echo "── $1 ──────────────────────────────────────────"; }

# ── 1. Register teacher ────────────────────────────────────────────────────────
step "1. Register teacher"
TEACHER=$(curl -sf -X POST "$BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"teacher_voice_$R@test.com\",\"password\":\"Test@1234\",\"displayName\":\"Prof Teste\"}")
echo "$TEACHER" | jq '{userId, email, role}'
TEACHER_TOKEN=$(echo "$TEACHER" | jq -r '.token')
[ "$TEACHER_TOKEN" != "null" ] || fail "teacher token is null"

# ── 2. Set teacher role ────────────────────────────────────────────────────────
step "2. Set teacher role"
curl -sf -X PUT "$BASE/auth/me/role" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"role":"Teacher"}' | jq '{role}'

# Re-login to get token with updated role claim
TEACHER=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"teacher_voice_$R@test.com\",\"password\":\"Test@1234\"}")
TEACHER_TOKEN=$(echo "$TEACHER" | jq -r '.token')
echo "Teacher role: $(echo "$TEACHER" | jq -r '.role')"

# ── 3. Register student ────────────────────────────────────────────────────────
step "3. Register student"
STUDENT=$(curl -sf -X POST "$BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"student_voice_$R@test.com\",\"password\":\"Test@1234\",\"displayName\":\"Aluno Teste\"}")
echo "$STUDENT" | jq '{userId, email, role}'
STUDENT_TOKEN=$(echo "$STUDENT" | jq -r '.token')
[ "$STUDENT_TOKEN" != "null" ] || fail "student token is null"

# Set student role
curl -sf -X PUT "$BASE/auth/me/role" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"role":"Student"}' | jq '{role}'

STUDENT=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"student_voice_$R@test.com\",\"password\":\"Test@1234\"}")
STUDENT_TOKEN=$(echo "$STUDENT" | jq -r '.token')
echo "Student role: $(echo "$STUDENT" | jq -r '.role')"

# ── 4. Teacher creates classroom ───────────────────────────────────────────────
step "4. Create classroom"
CLASSROOM=$(curl -sf -X POST "$BASE/classrooms" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Turma Teste Voz","description":"turma para teste do assistente de voz"}')
echo "$CLASSROOM" | jq '{id, title}'
CLASSROOM_ID=$(echo "$CLASSROOM" | jq -r '.id')
[ "$CLASSROOM_ID" != "null" ] || fail "classroom id is null"

# ── 5. Teacher creates subject ─────────────────────────────────────────────────
step "5. Create subject (Matemática)"
SUBJECT=$(curl -sf -X POST "$BASE/classrooms/$CLASSROOM_ID/subjects" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Matemática","description":"materia de teste"}')
echo "$SUBJECT" | jq '{id, name}'
SUBJECT_ID=$(echo "$SUBJECT" | jq -r '.id')
[ "$SUBJECT_ID" != "null" ] || fail "subject id is null"

# ── 6. Teacher creates activity ────────────────────────────────────────────────
step "6. Create activity in Matemática"
ACTIVITY=$(curl -sf -X POST "$BASE/subjects/$SUBJECT_ID/activities" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Atividade 1 - Aritmética",
    "description":"questoes basicas",
    "questions":[
      {"orderIndex":1,"text":"Quanto é 2+2?","options":[
        {"orderIndex":1,"text":"3","isCorrect":false},
        {"orderIndex":2,"text":"4","isCorrect":true}
      ]}
    ]
  }')
echo "$ACTIVITY" | jq '{id, title, subjectId}'
ACTIVITY_ID=$(echo "$ACTIVITY" | jq -r '.id')
[ "$ACTIVITY_ID" != "null" ] || fail "activity id is null"

# ── 7. Teacher creates invitation ──────────────────────────────────────────────
step "7. Create invitation link"
INVITE=$(curl -sf -X POST "$BASE/invitations" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"classroomId\":\"$CLASSROOM_ID\"}")
echo "$INVITE" | jq '{token, inviteUrl}'
INVITE_TOKEN=$(echo "$INVITE" | jq -r '.token')
[ "$INVITE_TOKEN" != "null" ] || fail "invite token is null"

# ── 8. Student joins classroom ─────────────────────────────────────────────────
step "8. Student joins classroom"
JOIN=$(curl -sf -X POST "$BASE/invitations/join" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$INVITE_TOKEN\"}")
echo "$JOIN" | jq '{classroomTitle, studentId, joinedAt}'

# ── 9. Voice command: lista atividades pendentes ───────────────────────────────
step "9. Voice command → 'lista atividades pendentes'"
VOICE=$(curl -sf -X POST "$BASE/voice-commands" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "transcript":"lista atividades pendentes",
    "screen":"home-student",
    "context":{"screen":"home-student","role":"student"}
  }')

echo
echo "=== VOICE RESPONSE ==="
echo "$VOICE" | jq .

# ── 10. Assert ─────────────────────────────────────────────────────────────────
step "10. Assert"
SPEAK=$(echo "$VOICE" | jq -r '.speak')
echo "speak: $SPEAK"

if echo "$SPEAK" | grep -qi "matem"; then
  echo "✅ PASS: response mentions 'Matemática' — fix is working"
else
  echo "❌ FAIL: 'Matemática' not found in speak field"
  echo "Full response: $(echo "$VOICE" | jq .)"
  exit 1
fi
