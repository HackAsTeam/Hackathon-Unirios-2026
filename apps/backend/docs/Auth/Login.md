# POST /auth/login

**Feature:** `src/HackathonUnirios2026.Application/Features/Auth/Login.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address. |
| password | string | Yes | User password. |

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
| 400 | Email or password is missing. |
| 401 | Email or password is invalid, or the account is locked out. |

## Example

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
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
