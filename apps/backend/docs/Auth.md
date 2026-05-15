# Auth Endpoints

All responses share the same shape (`AuthResponse`):

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Identity user ID. |
| email | string | User email address. |
| displayName | string | Public display name, when available. |
| avatarUrl | string | Profile avatar URL, when available. |
| token | string | API JWT bearer token. |

---

## POST /auth/register

**Command:** `src/HackathonUnirios2026.Application/Features/Auth/Commands/RegisterCommand.cs`

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address. |
| password | string | Yes | User password. |
| displayName | string | No | Public display name. |

### Error responses

| Status | Condition |
|--------|-----------|
| 400 | Email or password is missing, email already exists, or Identity rejects the password. |

### Example

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123",
  "displayName": "User Example"
}
```

```json
{
  "userId": "4ce1a6e6-0f7a-4f40-95c6-fbb258fd490d",
  "email": "user@example.com",
  "displayName": "User Example",
  "avatarUrl": null,
  "token": "<jwt>"
}
```

---

## POST /auth/login

**Command:** `src/HackathonUnirios2026.Application/Features/Auth/Commands/LoginCommand.cs`

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address. |
| password | string | Yes | User password. |

### Error responses

| Status | Condition |
|--------|-----------|
| 400 | Email or password is missing. |
| 401 | Email or password is invalid, or the account is locked out. |

### Example

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

```json
{
  "userId": "4ce1a6e6-0f7a-4f40-95c6-fbb258fd490d",
  "email": "user@example.com",
  "displayName": "User Example",
  "avatarUrl": null,
  "token": "<jwt>"
}
```

---

## POST /auth/google

**Command:** `src/HackathonUnirios2026.Application/Features/Auth/Commands/GoogleLoginCommand.cs`

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idToken | string | Yes | Google OpenID Connect ID token. |

### Error responses

| Status | Condition |
|--------|-----------|
| 400 | `idToken` is missing or the user cannot be created or linked. |
| 401 | Google rejects the token, the Google account email is not verified, or an existing local account with the same email is not confirmed. |

### Example

```http
POST /auth/google
Content-Type: application/json

{
  "idToken": "<google-id-token>"
}
```

```json
{
  "userId": "4ce1a6e6-0f7a-4f40-95c6-fbb258fd490d",
  "email": "user@example.com",
  "displayName": "User Example",
  "avatarUrl": "https://lh3.googleusercontent.com/a/example",
  "token": "<jwt>"
}
```
