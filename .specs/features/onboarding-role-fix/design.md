# Onboarding Role Fix — Design

**Spec**: `.specs/features/onboarding-role-fix/spec.md`
**Status**: Done

---

## Root Cause Analysis

### 404 on PUT /auth/me/role

```
Mobile → PUT http://localhost:5099/auth/me/role
           ↓
Backend (https profile): UseHttpsRedirection()
           ↓
307 Temporary Redirect → https://localhost:7214/auth/me/role
           ↓
React Native fetch() follows redirect, downgrades PUT → GET
           ↓
GET /auth/me/role: no route registered → 404
```

`launchSettings.json` defines two profiles:
- `http`: `http://localhost:5099` only — no redirect, no issue
- `https`: `https://localhost:7214;http://localhost:5099` — triggers redirect

When running with the `https` profile (IDE default or `--launch-profile https`),
`UseHttpsRedirection()` redirects all HTTP → HTTPS. Some React Native `fetch()`
implementations downgrade the HTTP method from PUT to GET when following 3xx
redirects (despite HTTP 307 semantics). `GET /auth/me/role` has no registered
route → 404.

### Onboarding loop

`(app)/_layout.tsx` only calls `useAccessibilityStore.getState().load()`.
`useOnboardingStore.getState().load()` was never called. On cold start, the
Zustand store initializes with `completed: false`. `sign-in.tsx` reads
`useOnboardingStore.getState().completed` synchronously in `redirectAfterLogin()`,
which always returns `false`, sending every login to `/onboarding`.

---

## Fix 1 — Program.cs

```csharp
// Before
app.UseHttpsRedirection();
app.UseCors("Expo");

// After
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("Expo");
```

Standard ASP.NET Core pattern. HTTPS redirect still enforced in production
where certificates are trusted and the PUT→GET downgrade is not an issue.

---

## Fix 2 — (app)/_layout.tsx

```typescript
// Before
useEffect(() => {
  useAccessibilityStore.getState().load();
}, []);

// After
useEffect(() => {
  useAccessibilityStore.getState().load();
  useOnboardingStore.getState().load();
}, []);
```

`load()` reads from SecureStore and synchronously updates the Zustand store via
`set()`. The layout runs before any protected screen is reachable, so the store
is hydrated by the time `redirectAfterLogin()` reads it.

---

## Data Flow After Fix

```
App cold start
  → (app)/_layout.tsx useEffect fires
  → accessibilityStore.load() + onboardingStore.load() run in parallel
  → onboardingStore: completed=true, role="teacher" restored from SecureStore

User taps login
  → sign-in.tsx handleSignIn()
  → await signIn(userId, token, ...)
  → redirectAfterLogin():
       useOnboardingStore.getState().completed  // now true
       → router.replace("/(app)/(tabs)")        // skips onboarding
```
