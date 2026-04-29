# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev  # Start with watch mode (port 3001)
npm run build      # Compile TypeScript
npm run seed       # Seed database with sample data
```

No test framework is configured.

## Architecture

NestJS 11 + TypeScript (strict) + TypeORM + PostgreSQL. Global prefix `/api`. CORS open for `localhost:5172` and `localhost:4172` in dev.

In production, `ServeStaticModule` serves the built React SPA from `../fe-casebuilder/dist`, with `/api/{*path}` and `/uploads/{*path}` excluded so API and upload routes are not hijacked by the SPA fallback.

### Auth

JWT via `@nestjs/passport` + `passport-jwt`. A global `APP_GUARD` (`JwtAuthGuard`) protects all routes. Decorate open routes with `@Public()` from `src/auth/public.decorator.ts`.

`ConfigModule` is global and loaded before all other modules. `JwtModule` and `TypeOrmModule` both use `registerAsync` + `ConfigService` injection to ensure env vars are available at startup.

Auth endpoints (all under `/api/auth`):
- `POST /login` — returns `{ access_token, user }`
- `POST /register` — creates user, returns `{ access_token, user }`
- `GET /me` — returns current user from JWT
- `PATCH /profile` — updates `full_name` and/or `password`
- `POST /logout` — stateless, returns `{ ok: true }`

### Entity Pattern

All 10 domain entities follow the same pattern:

```
src/entities/{name}/
  {name}.entity.ts      → extends BaseEntity (id UUID PK, created_date)
  {name}.service.ts     → extends CrudService<T>
  {name}.controller.ts  → extends CrudController<T>, decorated @Controller('{slug}')
  {name}.module.ts      → registers entity, service, controller
```

**Generic REST** (from `src/shared/crud.controller.ts`):
```
GET    /api/{slug}       ?sort=-field&limit=N&[field]=[val]  → list or filter
GET    /api/{slug}/:id   → get by id
POST   /api/{slug}       → create
PATCH  /api/{slug}/:id   → update
DELETE /api/{slug}/:id   → delete
```

`sort` prefix `-` means `DESC`. Remaining query params after `sort` and `limit` are treated as TypeORM `where` filters.

### Entity Slugs

`cases`, `tasks`, `fraud-alerts`, `documents`, `medical-records`, `tort-campaigns`, `communications`, `financial-records`, `predictions`, `intake-submissions`

### Integrations

`POST /api/integrations/core/invoke-llm` — calls Anthropic `claude-sonnet-4-6`. Strips markdown fences and parses JSON when `response_json_schema` is provided.

### JSONB Fields

TypeORM columns that need `type: 'jsonb'`: `ai_risk_factors`, `ai_strength_factors`, `diagnoses_extracted`, `procedures_extracted`, `medications_extracted`, `ai_timeline`, `defendants`, `qualifying_criteria`, `key_factors`, `ai_action_items`.

## Environment Variables (`.env`)

```
DATABASE_URL=postgres://alexsanudo@localhost:5432/casebuilder
JWT_SECRET=casebuilder-jwt-secret-dev
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
PORT=3001
```

`synchronize: true` is set in dev — TypeORM auto-migrates the schema on startup.

## Seed

`seeds/seed.ts` (run via `npm run seed`): truncates all tables, then inserts 2 users, 2 tort campaigns, 5 cases with related tasks, fraud alerts, medical records, documents, communications, financial records, predictions, and intake submissions.

Seed credentials: `admin@casebuilder.com` / `password123`
