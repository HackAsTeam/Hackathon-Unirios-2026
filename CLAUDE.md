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
dotnet run --project src/HackathonUnirios2026.Api
dotnet build HackathonUnirios2026.sln
dotnet dotnet-ef migrations add <Name> --project src/HackathonUnirios2026.Infra --startup-project src/HackathonUnirios2026.Api
dotnet dotnet-ef database update --project src/HackathonUnirios2026.Infra --startup-project src/HackathonUnirios2026.Api
```

All `dotnet` commands must be run from `apps/backend/`. The `dotnet-ef` tool is installed locally via `dotnet-tools.json`.

The API listens on `:5099` in the default launch profile. Connection string is
in `src/HackathonUnirios2026.Api/appsettings.Development.json` (gitignored).
Default points to `localhost:5432`, database `hackathon`, user/password
`postgres`.

## Architecture

### Mobile

**Routing** uses Expo Router file-based conventions with two route groups:

- `(auth)/` — unauthenticated screens (sign-in, sign-up)
- `(app)/` — protected screens; `_layout.tsx` redirects to `/(auth)/sign-in` when `isSignedIn` is false

**Auth state** lives in a Zustand store at `store/auth.ts` (`useAuthStore`). It holds `userId`, `token`, and `isSignedIn`. The `(app)/_layout.tsx` guard reads `isSignedIn` directly from this store.

**API calls** go through `lib/api.ts` (`apiFetch<T>`). It reads `EXPO_PUBLIC_API_URL` for the base URL and attaches a `Bearer` token when `token` is passed in options. TanStack Query is used for server state on top of `apiFetch`.

**UI** is built with Tamagui components and NativeWind (Tailwind) utility classes. Both are configured at the root layout level (`tamagui.config.ts`, `global.css`, `tailwind.config.js`).

### Backend

The backend solution is `HackathonUnirios2026.sln` and contains four projects:

- `src/HackathonUnirios2026.Api` — Minimal API startup, endpoint mapping, HTTP concerns, configuration
- `src/HackathonUnirios2026.Application` — use cases, MediatR requests and handlers, DTOs, validation
- `src/HackathonUnirios2026.Domain` — domain entities, value objects, domain rules
- `src/HackathonUnirios2026.Infra` — EF Core, Identity, database configuration, external infrastructure

**Vertical Slice Architecture** — features live under `src/HackathonUnirios2026.Application/Features/<FeatureName>/` with matching HTTP endpoint mapping in `src/HackathonUnirios2026.Api/Features/<FeatureName>/`.

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
  <FeatureName>Contracts.cs     # interfaces, domain-specific exceptions, value types
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

**Database** access goes through `AppDbContext` (`src/HackathonUnirios2026.Infra/Database/AppDbContext.cs`). EF Core configurations are applied via `ApplyConfigurationsFromAssembly`, so entity configs should implement `IEntityTypeConfiguration<T>` and live anywhere in the Infra assembly.

**OpenAPI** is available at `/openapi/v1.json` in development.
