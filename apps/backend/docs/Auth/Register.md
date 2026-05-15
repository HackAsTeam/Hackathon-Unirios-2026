# POST /auth/register

**Feature:** `src/HackathonUnirios2026.Application/Features/Auth/Register.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address. |
| password | string | Yes | User password. |
| displayName | string | No | Public display name. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Identity user ID. |
| email | string | User email address. |
| displayName | string | Public display name, when available. |
| avatarUrl | string | Profile avatar URL, when available. |
| token | string | API JWT bearer token. |

## Error responses

| Status | Condition |
|--------|-----------|
| 400 | Email or password is missing, email already exists, or Identity rejects the password. |

## Example

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123",
  "displayName": "User Example"
}
```

**Response:**

```json
{
  "userId": "4ce1a6e6-0f7a-4f40-95c6-fbb258fd490d",
  "email": "user@example.com",
  "displayName": "User Example",
  "avatarUrl": null,
  "token": "<jwt>"
}
```
