-- Migration: Google Calendar OAuth tokens
-- Stores access/refresh tokens per user for Google Calendar API integration

create table if not exists public.google_calendar_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  token_expiry timestamptz,
  google_email text,
  calendar_id text not null default 'primary',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_calendar_tokens_user_id_key unique (user_id)
);

-- Auto-update updated_at
create trigger set_updated_at_google_calendar_tokens
  before update on public.google_calendar_tokens
  for each row execute function update_updated_at_column();

-- Enable RLS
alter table public.google_calendar_tokens enable row level security;

-- Users can read/update/delete their own tokens
create policy "Users can view own tokens"
  on public.google_calendar_tokens for select
  using (auth.uid() = user_id);

create policy "Users can update own tokens"
  on public.google_calendar_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete own tokens"
  on public.google_calendar_tokens for delete
  using (auth.uid() = user_id);

-- Admins can see all tokens (for debugging)
create policy "Admins can view all tokens"
  on public.google_calendar_tokens for select
  using (get_my_role() = 'admin');

-- Enable realtime (optional, for future use)
alter publication supabase_realtime add table public.google_calendar_tokens;
