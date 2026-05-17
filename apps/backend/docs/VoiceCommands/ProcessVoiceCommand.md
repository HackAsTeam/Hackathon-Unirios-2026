# POST /voice-commands

**Feature:** `src/HackathonUnirios2026.Application/Features/VoiceCommands/Commands/ProcessVoiceCommandCommand.cs`

Processa um comando de voz transcrito pelo cliente. O Gemini interpreta o transcript no contexto da tela atual e do usuário autenticado e retorna uma ação tipada com feedback falado.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transcript | string | Yes | Texto transcrito da fala do usuário. |
| screen | string | Yes | Identificador da tela atual do app (ex: `"home"`, `"teacher-classroom"`, `"student-subject"`). |
| context | object \| null | No | Dados de contexto da tela (ex: `{ "classroomId": "uuid" }`). Varia por tela. |

### Valores conhecidos de `screen`

| Valor | Contexto esperado |
|-------|-------------------|
| `home` | nenhum |
| `teacher-classroom` | `{ "classroomId": "uuid" }` |
| `student-subject` | `{ "subjectId": "uuid" }` |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| type | string | `"COMMAND"` quando uma ação foi identificada; `"UNKNOWN"` caso contrário. |
| command | string \| null | Nome da ação a executar no cliente (ex: `"NAVIGATE_TO_CLASSROOMS"`). Null quando `type` é `"UNKNOWN"`. |
| payload | object \| null | Parâmetros adicionais necessários para executar o comando. Estrutura depende do `command`. |
| speak | string | Feedback em português falado pela IA para o usuário. |

### Comandos conhecidos

| Command | Payload | Descrição |
|---------|---------|-----------|
| `NAVIGATE_TO_CLASSROOMS` | null | Navega para a listagem de turmas. |
| `NAVIGATE_TO_PROFILE` | null | Navega para o perfil do usuário. |
| `NAVIGATE_TO_HOME` | null | Navega para a tela inicial. |
| `NAVIGATE_TO_CLASSROOM_AND_INVITE` | `{ "classroomId": "uuid" }` | Navega para uma turma específica e abre o fluxo de convite. |
| `SIGN_OUT` | null | Encerra a sessão do usuário. |
| `CREATE_CLASSROOM` | null | Abre o fluxo de criação de turma. |
| `OPEN_INVITE` | null | Abre o fluxo de convite na tela atual. |
| `START_ACTIVITY` | `{ "activityId": "uuid" }` | Inicia uma atividade específica. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Token ausente ou inválido. |

## Example

```http
POST /voice-commands
Content-Type: application/json
Authorization: Bearer <token>

{
  "transcript": "ir para minhas turmas",
  "screen": "home",
  "context": null
}
```

**Response (comando identificado):**

```json
{
  "type": "COMMAND",
  "command": "NAVIGATE_TO_CLASSROOMS",
  "payload": null,
  "speak": "Abrindo suas turmas!"
}
```

**Response (comando não reconhecido):**

```json
{
  "type": "UNKNOWN",
  "command": null,
  "payload": null,
  "speak": "Não entendi o que você disse. Pode repetir?"
}
```

**Example with context:**

```http
POST /voice-commands
Content-Type: application/json
Authorization: Bearer <token>

{
  "transcript": "quero convidar alunos para a turma de matemática",
  "screen": "home",
  "context": null
}
```

**Response:**

```json
{
  "type": "COMMAND",
  "command": "NAVIGATE_TO_CLASSROOM_AND_INVITE",
  "payload": { "classroomId": "a3f1c2d4-1234-5678-abcd-ef0123456789" },
  "speak": "Abrindo a turma de Matemática para você convidar alunos!"
}
```
