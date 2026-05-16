# DELETE /invitations/{id}

**Feature:** `src/HackathonUnirios2026.Application/Features/Invitations/Commands/RevokeInvitationLinkCommand.cs`

Revokes an invitation link so it can no longer be used. Only the classroom teacher can revoke invitations.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Invitation ID from the route. |

## Response `204`

No content.

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 403 | Authenticated user is not the classroom teacher. |
| 404 | Invitation does not exist. |

## Example

```http
DELETE /invitations/d1a3c4e5-1234-5678-90ab-cdef01234567
Authorization: Bearer <token>
```
