# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

pnpm workspace with two apps under `apps/`:

- `apps/mobile` — Expo (React Native) app, TypeScript
- `apps/backend` — ASP.NET Core 10 Minimal API, C#

## Commands

### Mobile (`apps/mobile`)

```bash
pnpm mobile          # start Expo dev server (from repo root)
pnpm mobile:android  # Android
pnpm mobile:ios      # iOS
pnpm mobile:web      # Web
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` before running.

### Backend (`apps/backend`)

```bash
dotnet run --project src/HackathonUnirios2026.API
dotnet build HackathonUnirios2026.sln
dotnet dotnet-ef migrations add <Name> --project src/HackathonUnirios2026.Infra --startup-project src/HackathonUnirios2026.API
dotnet dotnet-ef database update --project src/HackathonUnirios2026.Infra --startup-project src/HackathonUnirios2026.API
```

All `dotnet` commands must be run from `apps/backend/`. The `dotnet-ef` tool is installed locally via `dotnet-tools.json`.

The API listens on `:5099` in the default launch profile. Connection string is
in `src/HackathonUnirios2026.API/appsettings.Development.json` (gitignored).
Default points to `localhost:5432`, database `hackathon`, user/password
`postgres`.

## Architecture

### Mobile

**Routing** uses Expo Router file-based conventions with two route groups:

- `(auth)/` — unauthenticated screens (`sign-in.tsx`, `sign-up.tsx`)
- `(app)/` — protected screens; `_layout.tsx` redirects to `/(auth)/sign-in` when `isSignedIn` is false
  - `(app)/(tabs)/` — bottom-tab navigator (`index.tsx` home, `profile.tsx`)

**Auth state** lives in a Zustand store at `store/auth.ts` (`useAuthStore`). It holds `userId`, `token`, and `isSignedIn`. The `(app)/_layout.tsx` guard reads `isSignedIn` directly from this store.

**API calls** go through `lib/api.ts` (`apiFetch<T>`). It reads `EXPO_PUBLIC_API_URL` for the base URL and attaches a `Bearer` token when `token` is passed in options. TanStack Query is used for server state on top of `apiFetch`.

**UI** is built with Tamagui components and NativeWind (Tailwind) utility classes. Both are configured at the root layout level (`tamagui.config.ts`, `global.css`, `tailwind.config.js`).

### Backend

The backend solution is `HackathonUnirios2026.sln` and contains four projects:

- `src/HackathonUnirios2026.API` — Minimal API startup, endpoint mapping, HTTP concerns, configuration
- `src/HackathonUnirios2026.Application` — use cases, MediatR requests and handlers, DTOs, validation
- `src/HackathonUnirios2026.Domain` — domain entities, value objects, domain rules
- `src/HackathonUnirios2026.Infra` — EF Core, Identity, database configuration, external infrastructure

**Vertical Slice Architecture** — features live under `src/HackathonUnirios2026.Application/Features/<FeatureName>/` with matching HTTP endpoint mapping in `src/HackathonUnirios2026.API/Features/<FeatureName>/`.

Current feature groups:

| Feature | Application path | API path |
|---------|-----------------|----------|
| Auth | `Features/Auth/` | `Features/Auth/AuthEndpoints.cs` |
| Classrooms | `Features/Classrooms/` | `Features/Classrooms/ClassroomEndpoints.cs` |
| Subjects | `Features/Subjects/` | `Features/Subjects/SubjectEndpoints.cs` |
| Invitations | `Features/Invitations/` | `Features/Invitations/InvitationEndpoints.cs` |
| Exams | `Features/Exams/` | `Features/Exams/ExamEndpoints.cs` |
| ExamAttempts | `Features/ExamAttempts/` | `Features/Attempts/AttemptEndpoints.cs` |
| Activities | (reuses `Features/Exams/` queries) | `Features/Exams/ExamEndpoints.cs` |

Each feature folder uses this subfolder layout:

```
Features/<FeatureName>/
  Commands/
    <Action>Command.cs          # IRequest<TResponse> record
    <Action>CommandHandler.cs   # IRequestHandler<TCommand, TResponse> sealed class
  Queries/                      # same pattern for read-only operations
    <Action>Query.cs
    <Action>QueryHandler.cs
  DTOs/
    <FeatureName>Response.cs    # shared response DTO(s) used by commands/queries
  <FeatureName>Contracts.cs     # domain-specific exceptions thrown by handlers, caught by endpoints
```

Example command pair:

```csharp
// Features/Auth/Commands/LoginCommand.cs
public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;

// Features/Auth/Commands/LoginCommandHandler.cs
public sealed class LoginCommandHandler(UserManager<ApplicationUser> userManager, IJwtTokenIssuer jwtTokenIssuer)
    : IRequestHandler<LoginCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(LoginCommand cmd, CancellationToken ct) { ... }
}
```

**MediatR** dispatches requests to handlers (`IRequest<T>` / `IRequestHandler<T, R>`). All handlers in the Application assembly are auto-registered in `Program.cs`.

**Endpoint registration** — each endpoint class implements `IEndpoint` (`src/HackathonUnirios2026.API/IEndpoint.cs`) and is auto-discovered via `AddEndpoints` / `MapEndpoints` extension methods (`EndpointExtensions.cs`). No manual wiring is needed; add a new `IEndpoint` class and it is picked up automatically.

**Domain entities** live in `src/HackathonUnirios2026.Domain/Entities/`:

- `ApplicationUser` — ASP.NET Identity user (email, displayName, avatarUrl)
- `AuditableEntity` — base class with `CreatedAt`, `UpdatedAt`, `CreatedBy`
- `Classroom` — teacher-owned room; has `Enrollments`, `Subjects`, `InvitationLinks`, `ClassroomExams`
- `Enrollment` — student ↔ classroom join record
- `Subject` — topic inside a classroom
- `InvitationLink` — token-based invite with optional expiry and max-use limit
- `Exam` — exam with a list of `Question`s; optionally scoped to a `Subject` via `SubjectId`
- `Question` — ordered question with optional `ExpectedAnswer`; has `ICollection<QuestionOption> Options` for multiple-choice
- `QuestionOption` — a multiple-choice option with `Text` and `IsCorrect` flag
- `ClassroomExam` — assignment of an exam to a classroom with optional `DueAt`
- `ExamAttempt` — student's attempt at an exam; status driven by `AttemptStatus` enum (`InProgress`, `Submitted`, `Graded`)
- `QuestionAnswer` — student's answer to one question; supports `SelectedOptionId` (multiple-choice) or `AnswerText` (essay); graded by teacher via `Score` and `Feedback`

**Database** access goes through `AppDbContext` (`src/HackathonUnirios2026.Infra/Database/AppDbContext.cs`). EF Core configurations are applied via `ApplyConfigurationsFromAssembly`, so entity configs should implement `IEntityTypeConfiguration<T>` and live anywhere in the Infra assembly.

**OpenAPI** is available at `/openapi/v1.json` in development. Human-readable endpoint docs are in `apps/backend/docs/` (see `docs/README.md`).
