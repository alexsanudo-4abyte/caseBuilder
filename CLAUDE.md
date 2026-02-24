# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
npm run lint:fix   # Auto-fix lint issues
```

No test framework is configured.

## Architecture

React 18 SPA. All pages live in `src/pages/` and are auto-registered as routes by `@base44/vite-plugin` (manifest at `src/pages.config.js` — do not edit manually).

### Provider Hierarchy

```
AuthProvider → QueryClientProvider → Router → [/Login standalone | AuthenticatedApp → Layout → Pages]
```

`/Login` is defined explicitly in `App.jsx` before the wildcard route so it renders without the sidebar `Layout`.

### Auth

`src/lib/AuthContext.jsx` calls `GET /api/auth/me` on mount. On 401, sets `authError.type = 'auth_required'` → redirects to `/Login`. `Login.jsx` supports both sign-in and sign-up modes and calls `useAuth().login()` or `useAuth().register()` on submit.

### Data Layer

`src/api/base44Client.js` — axios adapter with JWT interceptor. Entity clients support `.list(sort, limit)`, `.filter(queryObj, sort, limit)`, `.get(id)`, `.create(data)`, `.update(id, data)`, `.delete(id)`. React Query wraps these for caching.

```js
base44.entities.Case.list('-created_date', 100)       // GET /api/cases?sort=-created_date&limit=100
base44.entities.Case.filter({ status: 'active' })     // GET /api/cases?status=active
base44.integrations.Core.InvokeLLM({ prompt, schema }) // POST /api/integrations/core/invoke-llm
```

JWT stored in `localStorage` under `cb_access_token`.

### Layout

`src/Layout.jsx` — sidebar nav + header. Contains the avatar dropdown (profile edit dialog, settings link, sign out). All authenticated pages render inside it via `{children}`.

### Styling

Tailwind CSS + Shadcn/UI (New York style) in `src/components/ui/`. CSS custom properties for theming defined in `Layout.jsx`'s inline `<style>` block. Use `@/` alias to import from `src/`.

### ESLint

Lints `components/`, `pages/`, and `Layout.jsx`. Ignores `lib/` and `components/ui/`. `react/prop-types` is disabled.

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
| Animations | Framer Motion |

## Environment

`VITE_API_BASE_URL=http://localhost:3000/api` in `.env.local`.
