# Case Builder

A legal case management platform. Monorepo with two workspaces; in production, the NestJS backend serves the React SPA from the same origin.

```
casebuilder/
├── fe-casebuilder/   # React 18 SPA (Vite) — http://localhost:5173 (dev)
└── be-casebuilder/   # NestJS REST API     — http://localhost:3000 (dev)
```

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+ (workspaces)
- **PostgreSQL** running locally (Docker image `postgres:15` on port 5432)

---

## Install

```bash
npm install   # run at repo root — hoists workspace deps
```

---

## Environment variables

### `be-casebuilder/.env`

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/casebuilder
JWT_SECRET=casebuilder-jwt-secret-dev
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=<64-char hex>
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
SENDGRID_FROM_NAME=Case Builder
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### `fe-casebuilder/.env.local`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Only needed in dev (the SPA runs on :5173 and hits the API on :3000). In prod, leave unset — the client falls back to `/api` same-origin.

---

## Seed the database

```bash
npm run seed
```

Login: `admin@casebuilder.com` / `password123`.

---

## Run (dev, two terminals)

```bash
npm run dev:be   # NestJS on :3000
npm run dev:fe   # Vite on :5173
```

Open `http://localhost:5173`.

---

## Build & run (production, single process)

```bash
npm run build    # vite build -> fe-casebuilder/dist, then nest build -> be-casebuilder/dist
npm run start    # node be-casebuilder/dist/src/main -- serves SPA + API
```

Open `http://localhost:3000`. NestJS's `ServeStaticModule` serves the SPA; `/api/*` routes still hit the API, `/uploads/*` still hits uploaded files.

---

## Deploy

Single Railway service. `railway.json` at repo root defines:

- `buildCommand`: `npm run build`
- `startCommand`: `npm run start`
- `healthcheckPath`: `/api/health`

Railway auto-detects Nixpacks + Node 20. All env vars listed above must be set on the service.

---

## Architecture notes

- **Framework (BE)**: NestJS 11 + TypeScript (strict), TypeORM 0.3, `synchronize: true` in dev.
- **Auth**: JWT via `@nestjs/passport`. Global `JwtAuthGuard` protects all routes; mark open routes with `@Public()`. RBAC via `@Roles()`; no decorator = admin only.
- **Entities**: 10 domain entities under `src/entities/{name}/`, each with the same CRUD pattern (via shared `CrudController`).
- **Generic REST**: `GET/POST/PATCH/DELETE /api/{slug}` for each entity, plus `?sort=-field&limit=N&[field]=[val]`.
- **LLM**: `POST /api/integrations/core/invoke-llm` calls Anthropic Claude.
- **Framework (FE)**: React 18 + Vite 6. Pages in `src/pages/` auto-register as routes via a Vite plugin (manifest `src/pages.config.js`).
- **Data layer**: `src/api/apiClient.js` is an axios adapter with a JWT interceptor; entity clients expose `.list/.filter/.get/.create/.update/.delete`. Wrapped in React Query for caching.
- **UI**: Tailwind CSS + Shadcn/UI (New York style) in `src/components/ui/`.
