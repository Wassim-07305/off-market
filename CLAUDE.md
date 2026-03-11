# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Off-Market est un CRM/plateforme de gestion pour agences de coaching et consultants (UI en francais). C'est une SPA/PWA React avec un backend Supabase, destinee aux freelances et coaches ciblant 10k+ EUR/mois. Plateforme multi-roles avec un systeme complet de gestion clients, pipeline commercial, formations, messagerie temps reel, gamification et suivi coaching.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build (`tsc -b && vite build`)
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview production build locally

## Architecture

### Tech Stack

React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + Supabase (PostgreSQL + Auth + RLS). State: Zustand (4 stores) + TanStack React Query (server state). Forms: React Hook Form + Zod. Charts: Recharts. Tables: TanStack React Table. DnD: @dnd-kit. PWA: vite-plugin-pwa. Deployed on Vercel.

### Directory Layout

```
src/
  App.tsx            # All routes defined here (React Router 6, 36 lazy-loaded pages)
  types/
    database.ts      # 15+ interfaces (Profile, Client, Lead, CallCalendar, etc.)
    forms.ts         # Zod schemas for all forms
  stores/
    auth-store.ts    # Session, user, profile, role state
    ui-store.ts      # Sidebar, theme, search, modals (persisted localStorage)
    chat-store.ts    # Chat state
    notification-store.ts
  hooks/             # ~41 custom hooks, one per entity/feature
    useAuth.ts, useClients.ts, useLeads.ts, useCloserCalls.ts, useCallCalendar.ts,
    useCoaching.ts, useContracts.ts, useFinances.ts, useForms.ts, useJournal.ts,
    useGamification.ts, useMessages.ts, useInstagram.ts, useAnnouncements.ts,
    useNotifications.ts, useDashboardStats.ts, useRole.ts, ...
  lib/
    supabase.ts      # Supabase client initialization
    permissions.ts   # Module -> AppRole matrix (27 modules, 3 roles)
    constants.ts     # 80+ constants (role labels, lead statuses, colors, etc.)
    utils.ts         # cn(), formatCurrency(EUR), formatDate(fr), formatRelativeDate()
    csv.ts           # CSV import/export via PapaParse
  components/
    ui/              # 26 shadcn-style components (button, card, modal, data-table, etc.)
    layout/          # Layout, Sidebar, Header, CommandPalette, MobileBottomNav
    auth/            # RouteGuard (auth redirect), RoleGuard (permission check)
    [feature]/       # 26 feature directories (clients/, leads/, calls/, finances/, etc.)
  pages/             # 37 route page components
supabase/
  migrations/        # 12 SQL migrations
```

### Key Patterns

**Data hooks**: Each entity has a hook in `src/hooks/` that wraps React Query. Queries use `useQuery` with `queryKey` arrays; mutations use `useMutation` with `queryClient.invalidateQueries` on success and `toast.error`/`toast.success` (Sonner) for feedback.

**Form modals**: Pattern is `[Entity]FormModal.tsx` using React Hook Form + `zodResolver` + Zod schema from `types/forms.ts`. The modal receives `open`, `onClose`, and optionally an entity ID for edit mode.

**Permissions**: `lib/permissions.ts` defines a `Module -> AppRole[]` matrix (27 modules). `RouteGuard` handles auth redirects. `RoleGuard` wraps routes to enforce module-level access. Trois roles : `admin`, `coach`, `prospect`.

**Code splitting**: Toutes les pages sont lazy-loaded via `React.lazy()` + `Suspense` + `PageLoader` skeleton.

**Real-time**: Supabase subscriptions pour messages et notifications.

**Responsive**: Mobile-first Tailwind + `MobileBottomNav` pour les petits ecrans. `CommandPalette` (Cmd+K) pour la navigation globale.

### Roles et permissions

| Role             | Description     | Acces                                                 |
| ---------------- | --------------- | ----------------------------------------------------- |
| `admin` (Alexia) | Full access     | Tous les modules, gestion users, finances, analytics  |
| `coach`          | Gestion clients | CRM, pipeline, formations, calls, messaging, coaching |
| `prospect`       | Acces limite    | Dashboard, journal, formations, messaging, communaute |

### Path Alias

`@/*` maps to `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`). Always use `@/` imports.

### Environment Variables

Prefixed with `VITE_` (accessed via `import.meta.env.VITE_*`). Defined in `.env.local`:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

### Supabase

- **Projet** : `srhpdgqqiuzdrlqaitdk`
- Acces DB : `source .env.local && psql "$DATABASE_URL"` (ou API REST via anon key)
- Client initialized in `lib/supabase.ts`
- RLS policies sur toutes les tables
- 12 migrations dans `supabase/migrations/`
- Tables principales : profiles, user_roles, clients, client_assignments, leads, call_calendar, closer_calls, financial_entries, payment_schedules, social_content, channels, messages, formations, module_items, gamification_entries, journal_entries, forms, form_submissions, contracts, coaching_sessions, notifications, announcements
- Real-time subscriptions pour messages et notifications

### Modules fonctionnels

1. **CRM** — Clients, leads (7 statuses : premier_message -> close), calendrier d'appels
2. **Ventes** — Closer calls, suivi commissions, revenue tracking
3. **Finances** — Revenus, couts, echeanciers de paiement (admin only)
4. **Formations (LMS)** — Modules de formation avec suivi progression
5. **Messagerie** — Channels + DMs temps reel via Supabase subscriptions
6. **Formulaires** — Form builder dynamique + submissions
7. **Gamification** — Points, badges, streaks, progression
8. **Journal/Rituels** — Check-ins quotidiens, suivi d'habitudes
9. **Coaching** — Sessions, notes, suivi
10. **Contrats** — Templates + gestion signatures
11. **Contenu** — Instagram scheduling, social media
12. **Communaute** — Feed d'activite, annonces
13. **Analytics** — KPIs, graphiques Recharts, metriques de performance
14. **Assistant IA** — Auto-reponses, analyse clients
15. **Onboarding** — Flow d'onboarding personnalise

## Conventions

- All UI text is in French
- Dates formatted with `date-fns` using `fr` locale via helpers in `lib/utils.ts`
- Currency formatted as EUR (fr-FR) via `formatCurrency()` in `lib/utils.ts`
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`
- Toast notifications via Sonner: `toast.success()` / `toast.error()`
- Icons from `lucide-react` exclusively
- `cn()` helper from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes
- React Query for all server state
- shadcn/ui for all UI primitives (26 components)
- PWA via vite-plugin-pwa
