# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Off-Market is a coaching and business management platform for freelancers and coaches (French-language UI). Built with Next.js App Router and Supabase, it features a multi-role system with five portals: admin (full platform control), coach (student management), client (learning & progress), setter/closer (sales), and sales. Core features: CRM with student tracking, call scheduling, messaging, training courses (LMS), form builder, gamification (XP, badges, leaderboard, challenges), invoicing, journaling, AI-powered coaching insights, and community feed.

## Commands

- `npm run dev` — Start Next.js dev server
- `npm run build` — Production build
- `npm run lint` — ESLint across the project

## Architecture

### Tech Stack
React 19 + TypeScript 5 + Next.js 16 (App Router) + Tailwind CSS 4 + Supabase (PostgreSQL + Auth + RLS + Storage). State: Zustand (3 stores) + TanStack React Query (server state, 29 hooks). Forms: Zod. Rich text: Tiptap. DnD: @dnd-kit. AI: Anthropic Claude SDK. Charts: Recharts. Deployed on Vercel.

### Directory Layout
```
src/
  app/
    layout.tsx             # Root layout (fonts, providers)
    page.tsx               # Root: role-based redirect to dashboard
    (auth)/                # Public auth routes (login, signup, forgot-password)
    auth/callback/         # OAuth code exchange
    admin/                 # Admin portal (~20 routes)
      dashboard/, analytics/, billing/, calls/, crm/, forms/, messaging/,
      onboarding/, school/, settings/, ...
    coach/                 # Coach portal (~12 routes)
      dashboard/, calls/, messaging/, school/, students/, ...
    client/                # Client portal (~15 routes)
      dashboard/, challenges/, checkin/, forms/, goals/, invoices/,
      journal/, leaderboard/, messaging/, onboarding/, progress/,
      school/, settings/, ...
    sales/                 # Sales portal (~6 routes)
      dashboard/, calls/, contacts/, messaging/, pipeline/, ...
    _shared-pages/         # Shared pages reused across roles
      calendar/, community/, messaging/, notifications/, profile/,
      resources/, schedule/, settings/
    api/
      ai/chat/route.ts    # Claude AI chat endpoint
      admin/create-client/route.ts  # Admin client creation
      account/delete/route.ts       # Account deletion
  components/
    calls/                 # Call scheduling components
    crm/                   # CRM/pipeline components
    dashboard/             # Dashboard widgets
    layout/                # Sidebar, mobile nav
    messaging/             # Chat interface
    providers/             # QueryClientProvider + ThemeProvider
    shared/                # Reusable components
  hooks/                   # 29 custom hooks with TanStack Query
    use-analytics.ts, use-auth.ts, use-badges.ts, use-calls.ts,
    use-challenges.ts, use-channels.ts, use-checkins.ts, use-coach-alerts.ts,
    use-coaching-goals.ts, use-contracts.ts, use-courses.ts, use-dashboard-stats.ts,
    use-feed.ts, use-forms.ts, use-invoices.ts, use-journal.ts, use-leaderboard.ts,
    use-messages.ts, use-notifications.ts, use-onboarding.ts, use-route-prefix.ts,
    use-sessions.ts, use-students.ts, use-supabase.ts, use-xp.ts
  stores/                  # Zustand stores
    ui-store.ts            # Sidebar, command palette, notifications, mobile menu
    form-builder-store.ts  # Form fields, selected field, preview mode, drag-reorder
    messaging-store.ts     # Active channel, thread/reply context, typing indicators, search
  lib/
    supabase/
      client.ts            # Browser Supabase client
      server.ts            # Server Supabase client
      middleware.ts         # Session refresh
    animations.ts          # Framer Motion variants (fadeInUp, scaleIn, slideIn, cardHover, stagger)
    constants.ts           # Status enums, labels, color mappings
    navigation.ts          # Role-based navigation trees (admin/coach/sales/client)
    utils.ts               # cn(), formatters
  types/                   # TypeScript types (Profile, Channel, Course, Form, AI types, etc.)
  middleware.ts            # Next.js middleware entry
supabase/
  migrations/              # 10 SQL migration files (001–010)
```

### Key Patterns

**Data hooks**: 29 custom hooks in `src/hooks/` wrapping TanStack React Query. Each hook provides `useQuery` for reads and `useMutation` for writes with cache invalidation and toast feedback. QueryClient configured with 60s staleTime.

**Multi-role navigation**: `lib/navigation.ts` defines separate nav trees per role. Dynamic route prefix (`/admin`, `/coach`, `/sales`, `/client`) via `useRoutePrefix()` hook. Mobile nav limited to 5 items.

**Zustand stores**: 3 stores for client-side UI state:
- `useUIStore` — sidebar, command palette, notifications panel, mobile menu
- `useFormBuilderStore` — form field management with drag-reorder
- `useMessagingStore` — active channel, threads, replies, typing indicators

**Client-side dominant**: 94 files with `"use client"`. Very few Server Components — data fetching is predominantly client-side via TanStack Query hooks calling Supabase browser client.

**AI integration**: Claude API endpoint at `/api/ai/chat`. System prompt configured for coaching/admin support: student analysis, risk detection, content generation. Model: claude-sonnet-4-5-20250514.

**Gamification**: XP system with badges, leaderboard, and challenges. Student engagement tags: VIP, Standard, New, At-Risk, Churned. Activity tracking across modules, lessons, forms, messages, calls, payments.

**Form builder**: Drag-and-drop form editor via @dnd-kit + Zustand store. Field types: text, email, phone, number, select, rating, NPS, scale, date, time, file upload, heading, paragraph, divider.

### Path Alias
`@/*` maps to `./src/*` (configured in `tsconfig.json`). Always use `@/` imports.

### Environment Variables
Defined in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only)
- `DATABASE_URL` — Direct database connection

### Supabase
- Browser client in `lib/supabase/client.ts`, server client in `lib/supabase/server.ts`
- Session management via middleware
- 10 migrations (initial schema, roles, billing, feed, coaching, gamification, call calendar)
- Roles: `admin`, `coach`, `setter`, `closer`, `client`, `sales`

## Conventions

- All UI text is in French
- Dates formatted with `date-fns` using `fr` locale
- TypeScript strict mode
- Toast notifications via Sonner
- Icons from `lucide-react`
- Fonts: Inter (sans) + JetBrains Mono (mono) + Satoshi (external)
- Light theme by default (next-themes)
- Animations via Framer Motion (shared variant library in `lib/animations.ts`)
- `cn()` helper for conditional Tailwind classes
- Radix UI primitives for accessible components
- TanStack Query for all data fetching (never fetch in useEffect directly)
