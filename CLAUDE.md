# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Case Builder** is a legal case management platform. Single monorepo, single Railway service: the NestJS backend serves the React SPA in production.

| Directory | Role | Dev port |
|-----------|------|----------|
| `fe-casebuilder/` | React 18 SPA (Vite) | 5172 |
| `be-casebuilder/` | NestJS REST API | 3001 |

npm workspaces hoist all deps to root `node_modules/`. Run `npm install` at the root — do not run `npm install` inside the workspace dirs.

Each workspace has its own `CLAUDE.md` with deeper context.

## Dev: two terminals

```bash
npm run dev:be   # NestJS on :3001
npm run dev:fe   # Vite on :5172 (proxies via VITE_API_BASE_URL)
```

In dev the SPA runs on :5172 and hits the API at :3001 cross-origin (CORS open to :5172). In prod, the SPA is built into `fe-casebuilder/dist/` and served by NestJS via `ServeStaticModule` from the same origin as `/api/*`.

## Prod: single service

```bash
npm run build    # builds fe (vite) then be (nest)
npm run start    # runs be-casebuilder start:prod, serving SPA + API
```

Railway picks this up from `railway.json` at the repo root. Healthcheck: `/api/health`.

## Database Setup

PostgreSQL runs locally via the `docker-compose.yml` at the repo root (container `casebuilder-db`, image `postgres:15`, named volume `casebuilder_db_data`). Host port is **5433** (container port 5432) to avoid colliding with a native macOS Postgres on 5432.

```bash
docker compose up -d    # start the DB
npm run seed            # seeds sample data via the be workspace
```

The backend connects via `DATABASE_URL=postgres://postgres:postgres@localhost:5433/casebuilder` in `be-casebuilder/.env`.

Seed credentials: `admin@casebuilder.com` / `password123`

## How the Two Halves Communicate

`fe-casebuilder/src/api/apiClient.js` is a thin axios adapter. Base URL resolves to `VITE_API_BASE_URL` or falls back to `/api` (same-origin). For local dev, `.env.local` sets it to `http://localhost:3001/api`. JWT tokens live in `localStorage` under `cb_access_token`.
