# Auth Endpoints

All responses share the same shape (`AuthResponse`):

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Identity user ID. |
| email | string | User email address. |
| displayName | string | Public display name, when available. |
| avatarUrl | string | Profile avatar URL, when available. |
| token | string | API JWT bearer token. |
| role | string | Global user role: `"Student"` or `"Teacher"`. |

The JWT includes a `ClaimTypes.Role` claim with the same value, enabling `[Authorize(Roles = "Teacher")]` on endpoints.

New users always start with `role: "Student"`. Use `PUT /auth/me/role` to change it.

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
  "token": "<jwt>",
  "role": "Student"
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
  "token": "<jwt>",
  "role": "Teacher"
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
  "token": "<jwt>",
  "role": "Student"
}
```

---

## PUT /auth/me/role

**Command:** `src/HackathonUnirios2026.Application/Features/Auth/Commands/SetRoleCommand.cs`

Requires authentication. Sets the calling user's global role and returns a fresh JWT with the updated claim. Intended to be called immediately after registration or first Google sign-in (onboarding step).

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | Yes | `"Student"` or `"Teacher"` (case-insensitive). |

### Error responses

| Status | Condition |
|--------|-----------|
| 400 | `role` is missing or is not a valid value. |
| 401 | No bearer token provided or token is invalid. |

### Example

```http
PUT /auth/me/role
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "role": "teacher"
}
```

```json
{
  "userId": "4ce1a6e6-0f7a-4f40-95c6-fbb258fd490d",
  "email": "user@example.com",
  "displayName": "User Example",
  "avatarUrl": null,
  "token": "<new-jwt>",
  "role": "Teacher"
}
```
