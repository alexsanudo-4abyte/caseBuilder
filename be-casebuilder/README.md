# Case Builder

A legal case management platform. The repo is a monorepo with two independent packages that run as separate processes and communicate over HTTP.

```
casebuilder/
├── fe-casebuilder/   # React 18 SPA (Vite) — http://localhost:5173
└── be-casebuilder/   # NestJS REST API     — http://localhost:3000
```

---

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** running locally

---

## Backend (`be-casebuilder`)

### 1. Install dependencies

```bash
cd be-casebuilder
npm install
```

### 2. Create the database

```bash
createdb casebuilder
```

### 3. Configure environment variables

Create `be-casebuilder/.env`:

```env
DATABASE_URL=postgres://<your-pg-user>@localhost:5432/casebuilder
JWT_SECRET=casebuilder-jwt-secret-dev
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
PORT=3000
```

Replace `<your-pg-user>` with your local PostgreSQL username. `ANTHROPIC_API_KEY` is only required if you use the LLM integration endpoint.

### 4. Seed sample data (optional)

```bash
npm run seed
```

Creates two users, 2 tort campaigns, 5 cases, and related tasks/documents/records.

Seed credentials: `admin@casebuilder.com` / `password123`

### 5. Start the dev server

```bash
npm run start:dev
```

The API is available at `http://localhost:3000/api`. TypeORM runs with `synchronize: true` in dev — the schema is auto-migrated on every startup.

### Architecture overview

- **Framework**: NestJS 11 + TypeScript (strict mode)
- **ORM**: TypeORM 0.3 with PostgreSQL
- **Auth**: JWT via `@nestjs/passport`. A global `JwtAuthGuard` protects all routes. Mark a route as public with `@Public()`.
- **Entities**: 10 domain entities (`cases`, `tasks`, `fraud-alerts`, `documents`, `medical-records`, `tort-campaigns`, `communications`, `financial-records`, `predictions`, `intake-submissions`). Each lives in `src/entities/{name}/` and follows the same CRUD pattern.
- **Generic REST**: A shared `CrudController` provides standard endpoints for every entity:
  ```
  GET    /api/{slug}       ?sort=-field&limit=N&[field]=[val]
  GET    /api/{slug}/:id
  POST   /api/{slug}
  PATCH  /api/{slug}/:id
  DELETE /api/{slug}/:id
  ```
- **LLM**: `POST /api/integrations/core/invoke-llm` calls Anthropic Claude.
- **Public intake**: `POST /api/intake/submit` — unauthenticated claimant self-submission (see [Intake Gateway](#intake-gateway) below).

---

### Intake Gateway

#### `POST /api/intake/submit`

Public endpoint — no JWT required. Accepts claimant self-submissions, de-duplicates by email, and creates an `IntakeSubmission` for staff review.

**Rate limit:** 5 requests per 15 minutes per IP.

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `full_name` | string | yes | max 100 chars |
| `email` | string | yes | valid email |
| `consent_given` | boolean | yes | must be `true` — any other value returns 400 |
| `consent_version` | string | yes | e.g. `"v1"` |
| `phone` | string | no | max 30 chars |
| `address` | string | no | max 255 chars |
| `date_of_birth` | string | no | free-form |
| `tort_campaign_id` | UUID | no | ties submission to a litigation campaign |
| `intake_channel` | `"web_form"` \| `"partner_api"` \| `"phone"` | no | defaults to `"web_form"` |
| `raw_payload` | object | no | free-form fields stored as immutable JSONB snapshot |

**Response `201`:**

```json
{
  "submission_id": "fe61461c-e3b4-4d5f-8377-34d8c82d2dc3",
  "status": "received",
  "message": "Your submission has been received and will be reviewed by our team."
}
```

**Error responses:**

| Code | Cause |
|------|-------|
| `400` | Validation failure (missing required field, `consent_given !== true`, invalid email, etc.) |
| `429` | Rate limit exceeded |

**Side effects:**
1. Looks up claimant by HMAC of email (PII is encrypted at rest, so exact-match queries use a deterministic hash). If not found, creates a new `Claimant`. If found, updates consent fields.
2. Creates an `IntakeSubmission` with `status = "pending_review"`.
3. Staff triage via `GET /api/intake-submissions` (requires JWT + staff role).

---

### Useful commands

```bash
npm run start:dev   # Dev server with watch mode
npm run build       # Compile TypeScript
npm run seed        # Re-seed the database
npm run lint        # Lint + auto-fix
```

---

## Frontend (`fe-casebuilder`)

### 1. Install dependencies

```bash
cd fe-casebuilder
npm install
```

### 2. Configure environment variables

Create `fe-casebuilder/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start the dev server

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

### Architecture overview

- **Framework**: React 18 with Vite 6
- **Routing**: Pages in `src/pages/` are auto-registered as routes by `vite-plugin`. The route manifest is `src/pages.config.js` — do not edit it manually.
- **Auth flow**: `AuthContext.jsx` calls `GET /api/auth/me` on mount. A 401 sets `authError.type = 'auth_required'` and redirects to `/Login`. The login page supports both sign-in and sign-up.
- **Data layer**: `src/api/apiClient.js` is an axios adapter with a JWT interceptor. Entity clients expose `.list()`, `.filter()`, `.get()`, `.create()`, `.update()`, `.delete()`. These are wrapped in React Query for caching.
- **JWT storage**: `localStorage` key `cb_access_token`.
- **UI**: Tailwind CSS + Shadcn/UI (New York style). Components live in `src/components/ui/`.

**Pages:**

| Route | Page file |
|---|---|
| `/` | Dashboard |
| `/cases` | Cases |
| `/cases/:id` | CaseDetail |
| `/campaigns` | Campaigns (tort campaigns) |
| `/communications` | Communications |
| `/financials` | Financials |
| `/fraud-monitor` | FraudMonitor |
| `/intake-hub` | IntakeHub |
| `/intake-review` | IntakeReview |
| `/medical-intel` | MedicalIntel |
| `/predictions` | Predictions |
| `/analytics` | Analytics |
| `/settings` | Settings |
| `/login` | Login (no sidebar layout) |

### Useful commands

```bash
npm run dev        # Dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint (quiet)
npm run lint:fix   # ESLint with auto-fix
```

---

## Running both services together

Open two terminals:

```bash
# Terminal 1
cd be-casebuilder && npm run start:dev

# Terminal 2
cd fe-casebuilder && npm run dev
```

Then open `http://localhost:5173` and log in with `admin@casebuilder.com` / `password123`.
