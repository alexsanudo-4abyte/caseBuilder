# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (Vite, http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint checks
npm run lint:fix   # Auto-fix linting issues
```

No test framework is configured.

## Architecture

**Case Builder** is a React 18 SPA (`fe-casebuilder/`) backed by a NestJS REST API (`be-casebuilder/`).

### Data Layer

All backend communication goes through `src/api/base44Client.js` — a thin axios adapter that mirrors the original Base44 SDK interface. Entity clients (`Case`, `Task`, `FraudAlert`, etc.) support `.list()`, `.filter()`, `.get()`, `.create()`, `.update()`, `.delete()`. React Query (`@tanstack/react-query`) wraps these calls for caching.

```js
base44.entities.Case.list('-created_date', 100)           // GET /api/cases?sort=-created_date&limit=100
base44.entities.Case.filter({ status: 'active' })         // GET /api/cases?status=active
base44.integrations.Core.InvokeLLM({ prompt, schema })    // POST /api/integrations/core/invoke-llm
```

JWT is stored in `localStorage` under `cb_access_token` and attached via axios request interceptor.

### Routing & Pages

Files placed in `src/pages/` are **auto-registered** as routes by `@base44/vite-plugin`. The manifest is at `src/pages.config.js` — do not edit manually. The `/Login` route is explicitly defined in `App.jsx` before the wildcard, so it renders without the Layout sidebar.

### Auth

`src/lib/AuthContext.jsx` calls `GET /api/auth/me` on mount. On 401, sets `authError.type = 'auth_required'` which triggers a redirect to `/Login`. The `Login.jsx` page calls `useAuth().login(email, password)`.

### Provider Hierarchy

```
AuthProvider → QueryClientProvider → Router → [/Login standalone | AuthenticatedApp → Layout → Pages]
```

`src/Layout.jsx` contains the sidebar navigation and header. All authenticated pages render inside it.

### Styling

Tailwind CSS with the custom theme in `tailwind.config.js` (CSS custom properties, sidebar theming, dark mode via `.dark` class). Shadcn/UI components (New York style) live in `src/components/ui/` — treat these as primitives, not business logic.

### Path Aliases

Use `@/` to import from `src/`:
```js
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/AuthContext"
```

### Key Dependencies

| Purpose | Library |
|---------|---------|
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Notifications | Sonner |
| Rich text | React Quill |
| Maps | React Leaflet |
| PDF export | jsPDF + html2canvas |
| Payments | Stripe |
| Animations | Framer Motion |

### ESLint

The ESLint config (`eslint.config.js`) lints `components/`, `pages/`, and `Layout.jsx` but **ignores** `lib/` and `components/ui/`. Prop validation (`react/prop-types`) is disabled.

## Backend (`be-casebuilder/`)

NestJS + TypeScript + TypeORM + PostgreSQL. Runs on port 3000.

```bash
npm run start:dev   # start with watch mode
npm run build       # compile
npm run seed        # seed database with sample data (requires running Postgres)
```

### Structure

- `src/shared/base.entity.ts` — `id` (UUID PK) + `created_date` shared by all entities
- `src/shared/crud.service.ts` — generic `list/filter/get/create/update/remove`; all entity services extend it
- `src/shared/crud.controller.ts` — generic REST controller; all entity controllers extend it
- `src/auth/` — JWT auth (`POST /api/auth/login`, `GET /api/auth/me`); `@Public()` decorator skips the global `JwtAuthGuard`
- `src/entities/{name}/` — one folder per domain entity (case, task, fraud-alert, document, medical-record, tort-campaign, communication, financial-record, prediction, intake-submission)
- `src/integrations/` — `POST /api/integrations/core/invoke-llm` → calls Anthropic `claude-sonnet-4-6`
- `seeds/seed.ts` — run with `npm run seed`; creates 1 admin user, 2 tort campaigns, 5 cases with related records

### Entity URL slugs
`cases`, `tasks`, `fraud-alerts`, `documents`, `medical-records`, `tort-campaigns`, `communications`, `financial-records`, `predictions`, `intake-submissions`

### Environment variables (`.env`)
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `PORT`

### Seed credentials
- `admin@casebuilder.com` / `password123`
- `jrodriguez@casebuilder.com` / `password123`
