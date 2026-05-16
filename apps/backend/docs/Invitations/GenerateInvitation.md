# POST /invitations

**Feature:** `src/HackathonUnirios2026.Application/Features/Invitations/Commands/GenerateInvitationLinkCommand.cs`

Generates an invitation link token for a classroom. Only the classroom teacher can generate invitations.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classroomId | string (uuid) | Yes | ID of the classroom to generate an invitation for. |
| expiresAt | string (date-time) | No | Expiration timestamp. Null means the link never expires. |
| maxUses | number | No | Maximum number of times the link can be used. Null means unlimited. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Invitation ID. |
| token | string | Opaque token shared with students to join the classroom. |
| classroomId | string (uuid) | Classroom the invitation belongs to. |
| expiresAt | string (date-time) \| null | Expiration timestamp, if set. |
| maxUses | number \| null | Max use limit, if set. |
| useCount | number | How many times the link has been used so far. |
| isActive | boolean | Whether the invitation is currently active. |
| createdAt | string (date-time) | Creation timestamp. |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 403 | Authenticated user is not the classroom teacher. |

## Example

```http
POST /invitations
Content-Type: application/json
Authorization: Bearer <token>

{
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "expiresAt": "2026-06-01T00:00:00Z",
  "maxUses": 30
}
```

**Response:**

```json
{
  "id": "d1a3c4e5-1234-5678-90ab-cdef01234567",
  "token": "abc123XYZ",
  "classroomId": "9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2",
  "expiresAt": "2026-06-01T00:00:00Z",
  "maxUses": 30,
  "useCount": 0,
  "isActive": true,
  "createdAt": "2026-05-16T15:00:00Z"
}
```
