# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Case Builder** is a legal case management platform. Single monorepo, single Railway service: the NestJS backend serves the React SPA in production.

| Directory | Role | Dev port |
|-----------|------|----------|
| `fe-casebuilder/` | React 18 SPA (Vite) | 5173 |
| `be-casebuilder/` | NestJS REST API | 3000 |

npm workspaces hoist all deps to root `node_modules/`. Run `npm install` at the root — do not run `npm install` inside the workspace dirs.

Each workspace has its own `CLAUDE.md` with deeper context.

## Dev: two terminals

```bash
npm run dev:be   # NestJS on :3000
npm run dev:fe   # Vite on :5173 (proxies via VITE_API_BASE_URL)
```

In dev the SPA runs on :5173 and hits the API at :3000 cross-origin (CORS open to :5173). In prod, the SPA is built into `fe-casebuilder/dist/` and served by NestJS via `ServeStaticModule` from the same origin as `/api/*`.

## Prod: single service

```bash
npm run build    # builds fe (vite) then be (nest)
npm run start    # runs be-casebuilder start:prod, serving SPA + API
```

Railway picks this up from `railway.json` at the repo root. Healthcheck: `/api/health`.

## Database Setup

PostgreSQL must be running locally (Docker: `api-db-1`, image `postgres:15`). The backend connects via `DATABASE_URL` in `be-casebuilder/.env`.

```bash
npm run seed   # seeds sample data via the be workspace
```

Seed credentials: `admin@casebuilder.com` / `password123`

## How the Two Halves Communicate

`fe-casebuilder/src/api/apiClient.js` is a thin axios adapter. Base URL resolves to `VITE_API_BASE_URL` or falls back to `/api` (same-origin). For local dev, `.env.local` sets it to `http://localhost:3000/api`. JWT tokens live in `localStorage` under `cb_access_token`.
