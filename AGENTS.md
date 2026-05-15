# AGENTS.md

This file gives Codex the project guidance that was previously captured in
`CLAUDE.md` and `.claude/agents/`.

## Monorepo Layout

This is a pnpm workspace with two apps under `apps/`:

- `apps/mobile` - Expo (React Native) app, TypeScript
- `apps/backend` - ASP.NET Core 10 Minimal API, C#

## Commands

### Mobile

Run mobile commands from the repository root:

```bash
pnpm mobile
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:web
```

Before running the mobile app, copy `apps/mobile/.env.example` to
`apps/mobile/.env` and set `EXPO_PUBLIC_API_URL`.

### Backend

Run all backend `dotnet` commands from `apps/backend/`:

```bash
dotnet run --project src/HackathonUnirios2026.API
dotnet build HackathonUnirios2026.sln
dotnet dotnet-ef migrations add <Name> --project src/HackathonUnirios2026.Infra --startup-project src/HackathonUnirios2026.API
dotnet dotnet-ef database update --project src/HackathonUnirios2026.Infra --startup-project src/HackathonUnirios2026.API
```

The API listens on `:5099` in the default launch profile. The local
`dotnet-ef` tool is installed through `dotnet-tools.json`.

The connection string key is `ConnectionStrings:Default`. Development settings
live in `src/HackathonUnirios2026.API/appsettings.Development.json`, which is
gitignored. The default local database is PostgreSQL on `localhost:5432`,
database `hackathon`, user/password `postgres`.

## Mobile Architecture

Routing uses Expo Router file-based conventions:

- `(auth)/` contains unauthenticated screens such as sign-in and sign-up.
- `(app)/` contains protected screens. Its `_layout.tsx` redirects to
  `/(auth)/sign-in` when `isSignedIn` is false.

Auth state lives in the Zustand store at `store/auth.ts` (`useAuthStore`). It
holds `userId`, `token`, and `isSignedIn`. The protected route layout reads
`isSignedIn` directly from this store.

API calls go through `lib/api.ts` (`apiFetch<T>`). It reads
`EXPO_PUBLIC_API_URL` for the base URL and attaches a `Bearer` token when
`token` is passed in options. TanStack Query is used for server state on top of
`apiFetch`.

UI uses Tamagui components and NativeWind utility classes. Both are configured
at the root layout level through `tamagui.config.ts`, `global.css`, and
`tailwind.config.js`.

## Backend Architecture

The backend solution is `apps/backend/HackathonUnirios2026.sln` and contains
four projects:

- `src/HackathonUnirios2026.API` - Minimal API startup, endpoint mapping, HTTP
  concerns, configuration.
- `src/HackathonUnirios2026.Application` - use cases, MediatR requests and
  handlers, DTOs, validation.
- `src/HackathonUnirios2026.Domain` - domain entities, value objects, domain
  rules.
- `src/HackathonUnirios2026.Infra` - EF Core, Identity, database configuration,
  external infrastructure.

Use Vertical Slice Architecture inside the Application and API projects. Each
use case should keep its request, response, handler, and validator together
under `src/HackathonUnirios2026.Application/Features/<Domain>/`. Endpoint
mapping lives in a matching API feature file under
`src/HackathonUnirios2026.API/Features/<Domain>/` and should only translate HTTP
to MediatR.

Use this canonical shape:

```csharp
namespace HackathonUnirios2026.Application.Features.<Domain>;

public static class <UseCaseName>
{
    public record Request(...) : IRequest<Response>;
    public record Response(...);

    public sealed class Handler : IRequestHandler<Request, Response>
    {
        public async Task<Response> Handle(Request req, CancellationToken ct)
        {
            return new Response(...);
        }
    }

}
```

Register endpoints in `Program.cs` by calling each API slice's `MapEndpoint`
method. MediatR request handlers are auto-registered from the Application
assembly in `Program.cs`.

Database access goes through
`src/HackathonUnirios2026.Infra/Database/AppDbContext.cs`.
`OnModelCreating` uses `ApplyConfigurationsFromAssembly`, so entity
configurations should implement `IEntityTypeConfiguration<T>` and can live
anywhere in the Infra assembly, preferably in `Database/Configurations/` or next
to the entity.

OpenAPI is available at `/openapi/v1.json` in development.

## Codex Task Profiles

Codex does not use Claude's `.claude/agents/*.md` files directly. Apply the
profiles below when the user asks for the matching kind of work.

### Backend Engineer Profile

Use this profile for backend work in `apps/backend`: adding features, creating
migrations, writing EF Core entities and configurations, implementing CQRS
slices with MediatR, or debugging .NET/PostgreSQL issues.

Backend rules:

- Keep each use case in one self-contained file under
  `src/HackathonUnirios2026.Application/Features/<Domain>/`.
- Co-locate request, response, handler, and validator in the Application slice.
  Keep HTTP endpoint mapping in
  `src/HackathonUnirios2026.API/Features/<Domain>/`.
- Do not introduce shared service layers outside `Infra`.
- Use C# 12+ features where they fit: primary constructors, collection
  expressions, and `required` properties.
- Use records for DTOs and classes for entities.
- Request records must implement `IRequest<Response>`.
- Handlers must be `sealed` and receive dependencies through primary
  constructors.
- Pass `CancellationToken ct` to every async EF Core call.
- Keep business logic out of `MapEndpoint`.
- Validate inputs inside the handler or with a dedicated validator class in the
  same file.
- Return typed `IResult` values from endpoints, such as `Results.Ok`,
  `Results.Created`, and `Results.NotFound`.
- Do not use `async void`, `.Result`, or `.Wait()`.
- Add migrations for schema changes.
- Add comments only when the reason is not obvious.

EF Core rules:

- New entities must have explicit `IEntityTypeConfiguration<T>` configuration.
- Use explicit column types such as `varchar`, `text`, `uuid`, and
  `timestamptz`; do not rely on convention-only configuration.
- Always configure keys with `HasKey`.
- Configure required columns with `IsRequired`.
- Prefer database-generated `Guid` primary keys with
  `HasDefaultValueSql("gen_random_uuid()")`.
- Filter queries before materializing data.

### Code Reviewer Profile

Use this profile when reviewing a PR, feature branch, or completed backend
change before human review. Prioritize correctness, architectural consistency,
security, and missing tests over style preferences.

Review checklist:

- Each use case is a self-contained file under
  `src/HackathonUnirios2026.Application/Features/<Domain>/`.
- Slices do not call each other and no cross-slice service layer was added.
- Request records implement `IRequest<Response>`.
- Handlers are `sealed` and use primary constructors for dependencies.
- `CancellationToken ct` is passed to async EF Core calls.
- Business logic does not leak into `MapEndpoint`.
- New entities have explicit `IEntityTypeConfiguration<T>` configuration.
- Column types are explicit.
- `Guid` primary keys use `HasDefaultValueSql("gen_random_uuid()")`.
- Queries filter before materializing.
- No `.Result`, `.Wait()`, `async void`, or commented-out code remains.
- No raw SQL uses user-supplied values unless parameterized.
- Response records do not expose passwords, tokens, or sensitive data.
- Auth-required endpoints are actually protected.
- Endpoints return typed results.
- Migrations exist for schema changes.

Review output format:

- Start with `APPROVED` or `CHANGES REQUESTED`.
- For every issue, include the file path and line reference, describe what is
  wrong, why it matters, and what should change.
- If approved and endpoints were added or changed, also update the endpoint docs
  using the Documentation Writer Profile before considering the task complete.

### Documentation Writer Profile

Use this profile after a backend feature is complete or when endpoint docs need
to be created or updated. Generate docs from slice files under
`apps/backend/src/HackathonUnirios2026.Application/Features/` and matching
endpoint files under `apps/backend/src/HackathonUnirios2026.API/Features/`.

For each documented slice, create or update:

```text
apps/backend/docs/<Domain>/<UseCaseName>.md
```

Each endpoint doc must use this structure:

````markdown
# <HTTP Method> <route>

**Feature:** `src/HackathonUnirios2026.Application/Features/<Domain>/<UseCaseName>.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ...   | ...  | ...      | ...         |

## Response `<status code>`

| Field | Type | Description |
|-------|------|-------------|
| ...   | ...  | ...         |

## Error responses

| Status | Condition |
|--------|-----------|
| ...    | ...       |

## Example

```http
POST /route
Content-Type: application/json
Authorization: Bearer <token>

{
  "field": "value"
}
```

**Response:**

```json
{
  "field": "value"
}
```
````

Documentation rules:

- Read the complete slice file before writing docs.
- Derive request and response fields from `record Request` and
  `record Response`, not assumptions.
- If a doc already exists, update only sections that changed and preserve manual
  context.
- Document `Guid` fields as `string (uuid)`.
- If the endpoint requires auth, include the bearer token in the example.
- After writing endpoint docs, update or create `apps/backend/docs/README.md` as
  an index listing every documented endpoint as
  `METHOD /route - brief description`.
- Keep the language concise and precise.
- Do not invent behavior not present in the code.
