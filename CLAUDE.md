# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Off-Market est un CRM/plateforme de gestion pour agences de coaching et consultants (UI en français). Destinée aux freelances et coaches ciblant 10k+ EUR/mois. Plateforme multi-rôles avec gestion clients, pipeline commercial, formations (LMS), messagerie temps réel, gamification et suivi coaching.

## Commands

- `npm run dev` — Start Next.js dev server
- `npm run build` — Next.js production build
- `npm run start` — Start production server
- `npm run lint` — ESLint
- `npx playwright test` — Run Playwright e2e tests

## Architecture

### Tech Stack

**Next.js 16** (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + Supabase (PostgreSQL + Auth + RLS). State: Zustand 5 (client stores) + TanStack React Query 5 (server state). Forms: React Hook Form + Zod 4. Charts: Recharts. Tables: TanStack React Table. DnD: @dnd-kit. Rich text: Tiptap. Animations: Framer Motion. Email: Resend. AI: OpenRouter + Gemini. Deployed on Vercel.

### Route Groups (App Router)

```
src/app/
  (auth)/          # login, register, forgot-password, signup
  (marketing)/     # landing page
  (onboarding)/    # onboarding flow
  (public)/        # public routes: book/, contracts/, lead-magnet/
  admin/           # admin-only pages (full access)
  coach/           # coach pages
  client/          # client pages
  sales/           # closer/setter pages (pipeline, calls, commissions)
  _shared-pages/   # shared pages across roles
  api/             # API routes (AI, admin, auth, cron, webhooks, etc.)
  f/               # form public embed routes
```

Each role group has its own `layout.tsx` with sidebar/navigation.

### Supabase Clients

Three distinct clients in `src/lib/supabase/`:
- `client.ts` — Browser client (`"use client"`), cookie-based session storage
- `server.ts` — Server Component client (`await cookies()` from `next/headers`)
- `admin.ts` — Service role client (bypasses RLS, server-only)
- `middleware.ts` — Session refresh in Next.js middleware

Always use the appropriate client: server client in Server Components/Route Handlers, browser client in Client Components.

### Directory Layout

```
src/
  app/             # Next.js App Router pages and API routes
  types/
    database.ts    # Core interfaces + AppRole type
    forms.ts       # Zod schemas for all forms
  stores/
    auth-store.ts  # Session, user, profile, role state
    ui-store.ts    # Sidebar, theme, search, modals (persisted localStorage)
    chat-store.ts
    notification-store.ts
  hooks/           # 150+ custom hooks, one per entity/feature (kebab-case)
  lib/
    supabase/      # Client variants (client, server, admin, middleware)
    permissions.ts # Module -> AppRole[] matrix + canAccess()
    constants.ts   # Role labels, lead statuses, colors, etc.
    utils.ts       # cn(), formatCurrency(EUR), formatDate(fr), formatRelativeDate()
    gemini.ts      # Google Gemini AI integration
    openrouter.ts  # OpenRouter AI integration
    rate-limit.ts  # In-memory rate limiting for API routes
    csv.ts         # CSV import/export via PapaParse
    pdf.ts         # PDF generation helpers
  components/
    ui/            # shadcn-style primitives (Radix UI-based)
    providers/     # React providers (Providers wrapper, BrandingProvider)
    layout/        # Sidebar, Header, CommandPalette, MobileBottomNav
    [feature]/     # Feature-specific components
  middleware.ts    # Auth session + rate limiting (all routes except static)
```

### Key Patterns

**Server vs Client Components**: Default to Server Components. Add `"use client"` only when needed (interactivity, hooks, browser APIs). API Route Handlers in `src/app/api/` use the server Supabase client.

**Data hooks**: Each entity has a hook in `src/hooks/` wrapping React Query. Queries use `useQuery`; mutations use `useMutation` + `queryClient.invalidateQueries` on success + `toast.success`/`toast.error` (Sonner) for feedback.

**Form modals**: Pattern is `[Entity]FormModal.tsx` using React Hook Form + `zodResolver` + Zod schema from `types/forms.ts`. The modal receives `open`, `onClose`, and optionally an entity ID for edit mode.

**Permissions**: `lib/permissions.ts` defines a `Module -> AppRole[]` matrix. `canAccess(role, module)` is the main check. Route-level access is enforced per-layout with server-side role verification.

**Middleware**: `src/middleware.ts` runs on all non-static routes. Handles session refresh via `updateSession()` and rate limiting for `/api/*` routes (different presets for `/api/ai/`, `/api/v1/`, generic API).

**Real-time**: Supabase subscriptions for messages, notifications, presence, and typing indicators.

**Responsive**: Mobile-first Tailwind + `MobileBottomNav` for small screens. `CommandPalette` (Cmd+K) for global navigation.

### Roles & Permissions

Six roles: `admin`, `coach`, `client`, `prospect`, `setter`, `closer`

| Role       | Access                                                         |
| ---------- | -------------------------------------------------------------- |
| `admin`    | Everything — finances, analytics, users, billing, audit        |
| `coach`    | CRM, clients, sessions, content, calendar, messaging           |
| `client`   | Dashboard, school, journal, gamification, messaging, contracts |
| `prospect` | Dashboard, school, journal, gamification, messaging            |
| `setter`   | Pipeline, activité, messaging, contracts, resources            |
| `closer`   | Pipeline, closer-calls, activité, messaging, contracts         |

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`). Always use `@/` imports.

### Environment Variables

Key env vars (see `.env.example` for the full list):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, bypasses RLS) |
| `NEXT_PUBLIC_APP_URL` | App base URL |
| `OPENROUTER_API_KEY` | AI completions via OpenRouter |
| `RESEND_API_KEY` | Transactional email |
| `GOOGLE_CLIENT_ID/SECRET` | Google Calendar OAuth |
| `CRON_SECRET` | Auth header for cron job API routes |
| `B2_*` | Backblaze B2 file storage |
| `STRIPE_*` | Stripe billing |
| `UNIPILE_*` | Unified messaging (LinkedIn, etc.) |

### Supabase

- **Projet** : `srhpdgqqiuzdrlqaitdk`
- DB access: `source .env.local && psql "$DATABASE_URL"`
- RLS policies on all tables
- 140 migrations in `supabase/migrations/`
- Main tables: profiles, user_roles, clients, client_assignments, leads, call_calendar, closer_calls, financial_entries, payment_schedules, social_content, channels, messages, formations, module_items, gamification_entries, journal_entries, forms, form_submissions, contracts, coaching_sessions, notifications, announcements

### Next.js Config Notes

- `typescript.ignoreBuildErrors: true` — pre-existing TS errors from Vite→Next.js migration; TODO: fix via `supabase gen types`
- `eslint.ignoreDuringBuilds: true` — same reason
- React Compiler enabled (`babel-plugin-react-compiler`)
- `compiler.removeConsole` — removes all `console.*` except `console.error` in production

## Conventions

- All UI text in French
- Dates: `date-fns` with `fr` locale via helpers in `lib/utils.ts`
- Currency: EUR via `formatCurrency()` in `lib/utils.ts`
- TypeScript strict mode
- Toast notifications via Sonner: `toast.success()` / `toast.error()`
- Icons: `lucide-react` exclusively
- `cn()` helper from `lib/utils.ts` (clsx + tailwind-merge)
- Hook files: kebab-case (`use-feature-name.ts`), some legacy camelCase (`useChannels.ts`)
- Supabase client: always import from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (server)
- Auth: always use `useAuth()` from `@/hooks/use-auth` (React Context) — never Zustand stores for auth state
