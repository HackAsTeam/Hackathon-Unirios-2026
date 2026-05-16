# Hackathon UniRios 2026

Aplicação full-stack para o hackathon UniRios 2026. Consiste em um app mobile React Native (Expo) conectado a uma API ASP.NET Core com banco PostgreSQL.

## Tech Stack

**Mobile:** React Native · Expo Router · TypeScript · Zustand · TanStack Query · Tamagui + NativeWind · Google OAuth

**Backend:** ASP.NET Core 10 Minimal API · C# · MediatR (CQRS / Vertical Slice) · EF Core · PostgreSQL · JWT · Google OAuth

**Infra:** Docker Compose · pnpm workspaces

## Pré-requisitos

- **Node.js** 20+ e **pnpm** 9+
- **.NET SDK** 10
- **Docker** e **Docker Compose**

## Setup

### 1. Clonar e instalar dependências

```bash
git clone <url>
cd Hacakthon-Unirios-2026
pnpm install
```

---

### 2. Backend

Escolha uma das opções abaixo.

#### Opção A — Docker Compose (recomendado)

Crie um arquivo `.env` na raiz do repositório:

```env
# Obrigatório
JWT_SIGNING_KEY=troque-por-uma-chave-segura-com-32-chars-minimo

# Opcional (padrão: postgres)
POSTGRES_PASSWORD=postgres

# Opcional — URL pública da API usada em redirects de convite
# Use o IP da sua máquina no lugar de localhost para que o app mobile
# consiga abrir o link de convite. Veja como descobrir seu IP abaixo.
APP_BASE_URL=http://localhost:5099

# Opcional — scheme do deep link do app mobile (padrão: hackathon-app)
APP_MOBILE_SCHEME=hackathon-app

# Opcional — só necessário para login com Google
GOOGLE_WEB_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
```

Suba os serviços:

```bash
docker-compose up -d
```

O compose sobe o banco PostgreSQL (porta **`5433`** no host → `5432` no container) e a API (porta **`5099`**). As migrations são aplicadas automaticamente na inicialização da API.

> **Fluxo de link de convite:** o app mobile precisa conseguir abrir a URL gerada pelo backend. Se deixar `APP_BASE_URL=http://localhost:5099`, o link funcionará apenas no próprio computador. Para testar com um dispositivo físico ou emulador, substitua `localhost` pelo IP da sua máquina na rede local:
>
> ```bash
> # Linux
> ip route get 1 | awk '{print $7}'
>
> # macOS
> ipconfig getifaddr en0
>
> # Windows (PowerShell)
> (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi).IPAddress
> ```
>
> Exemplo com IP `192.168.1.100`:
> ```env
> APP_BASE_URL=http://192.168.1.100:5099
> ```

#### Opção B — .NET local

Requer PostgreSQL local. O arquivo `apps/backend/src/HackathonUnirios2026.API/appsettings.Development.json` já existe no repositório com valores padrão para desenvolvimento local:

- Connection string: `localhost:5432`, database `hackathon`, user `postgres`
- JWT signing key já preenchida (apenas para dev local)
- Google OAuth já configurado com client IDs de dev

Se precisar sobrescrever algum valor, edite esse arquivo diretamente. Execute as migrations e suba a API a partir de `apps/backend/`:

```bash
cd apps/backend
dotnet dotnet-ef database update --project src/HackathonUnirios2026.Infra --startup-project src/HackathonUnirios2026.API
dotnet run --project src/HackathonUnirios2026.API
```

A API fica disponível em `http://localhost:5099`.

---

### 3. Mobile

Copie o arquivo de variáveis de ambiente:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Edite `apps/mobile/.env`:

```env
# URL da API (obrigatório)
EXPO_PUBLIC_API_URL=http://localhost:5099

# Google OAuth (opcional — necessário para login com Google)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
# Expo Go only: https://auth.expo.io/@seu-username/hackathon-app
EXPO_PUBLIC_GOOGLE_REDIRECT_URI=
```

> **Android emulator:** use `http://10.0.2.2:5099` em vez de `localhost`.

Inicie o servidor de desenvolvimento:

```bash
pnpm mobile          # Expo dev server (pressione w / a / i no terminal)
pnpm mobile:web      # Web
pnpm mobile:android  # Android
pnpm mobile:ios      # iOS
```

---

## Documentação da API

- **OpenAPI JSON:** `http://localhost:5099/openapi/v1.json`
- **Docs em markdown:** [`apps/backend/docs/README.md`](apps/backend/docs/README.md)

Domínios cobertos: Auth · Classrooms · Subjects · Invitations · Exams · Activities · Exam Attempts

---

## Estrutura do projeto

```
Hacakthon-Unirios-2026/
├── apps/
│   ├── mobile/                        # Expo React Native
│   │   ├── app/
│   │   │   ├── (auth)/                # Telas públicas (sign-in, sign-up)
│   │   │   └── (app)/                 # Telas protegidas (guard no _layout.tsx)
│   │   │       └── (tabs)/            # Navegação por abas (home, profile)
│   │   ├── lib/                       # apiFetch, googleAuth
│   │   └── store/                     # Zustand (auth state)
│   └── backend/                       # ASP.NET Core
│       ├── docs/                      # Documentação markdown dos endpoints
│       └── src/
│           ├── HackathonUnirios2026.API/         # Endpoints, configuração HTTP
│           │   └── Features/
│           │       ├── Auth/           # POST /auth/register|login|google
│           │       ├── Classrooms/     # CRUD de salas
│           │       ├── Subjects/       # Matérias por sala
│           │       ├── Invitations/    # Convites por token
│           │       ├── Exams/          # Provas e atividades por matéria
│           │       └── Attempts/       # Tentativas e respostas de alunos
│           ├── HackathonUnirios2026.Application/ # Handlers MediatR, DTOs, contratos
│           ├── HackathonUnirios2026.Domain/      # Entidades, enums (AttemptStatus etc.)
│           └── HackathonUnirios2026.Infra/       # EF Core, Identity, migrations
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

## Comandos úteis

### Backend (`cd apps/backend` primeiro)

```bash
dotnet run --project src/HackathonUnirios2026.API

dotnet build HackathonUnirios2026.sln

# Nova migration
dotnet dotnet-ef migrations add <Nome> \
  --project src/HackathonUnirios2026.Infra \
  --startup-project src/HackathonUnirios2026.API

# Aplicar migrations
dotnet dotnet-ef database update \
  --project src/HackathonUnirios2026.Infra \
  --startup-project src/HackathonUnirios2026.API
```

### Docker

```bash
docker-compose up -d          # Sobe DB + API
docker-compose logs -f api    # Logs da API
docker-compose down           # Para os serviços
docker-compose down -v        # Para e apaga o volume do banco
```

---

## Solução de problemas

**Mobile não conecta ao backend**
- Confirme `EXPO_PUBLIC_API_URL` em `apps/mobile/.env`
- No Android emulator use `http://10.0.2.2:5099`

**Erro de conexão com o banco**
- Docker: verifique `docker-compose ps` e `docker-compose logs db`
- Local: confirme que o PostgreSQL está rodando e que `appsettings.Development.json` tem a connection string correta
- Rode as migrations caso ainda não tenha feito

**Portas ocupadas**
- A API usa `5099` e o banco expõe `5433` no host (mapeado para `5432` no container); libere essas portas antes de subir o compose
