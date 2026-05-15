# POST /auth/google

**Feature:** `src/HackathonUnirios2026.Application/Features/Auth/GoogleLogin.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idToken | string | Yes | Google OpenID Connect ID token returned by Expo AuthSession. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Identity user ID. |
| email | string | Google account email address. |
| displayName | string | Public display name, when available. |
| avatarUrl | string | Google profile picture URL, when available. |
| token | string | API JWT bearer token. |

## Error responses

| Status | Condition |
|--------|-----------|
| 400 | `idToken` is missing or the user cannot be created or linked. |
| 401 | Google rejects the token, the Google account email is not verified, or an existing local account with the same email is not confirmed. |

## Example

```http
POST /auth/google
Content-Type: application/json

{
  "idToken": "<google-id-token>"
}
```

**Response:**

```json
{
  "userId": "4ce1a6e6-0f7a-4f40-95c6-fbb258fd490d",
  "email": "user@example.com",
  "displayName": "User Example",
  "avatarUrl": "https://lh3.googleusercontent.com/a/example",
  "token": "<jwt>"
}
```
