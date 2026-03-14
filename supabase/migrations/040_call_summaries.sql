-- Migration 040: Call Summaries (fusion transcript + pre-call + notes)
-- Document de synthese genere par IA apres un appel

create table if not exists public.call_summaries (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.call_calendar(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,

  -- Contenu genere
  content text not null,                    -- Synthese complete en markdown
  sections jsonb not null default '{}',     -- Sections structurees (contexte, points_cles, actions, etc.)

  -- Metadonnees
  model text not null default 'claude-sonnet-4-5-20250514',
  tokens_used integer,
  generation_time_ms integer,

  -- Sources utilisees pour la generation
  sources jsonb not null default '{}',      -- {has_transcript, has_pre_call, has_session_notes, has_call_notes}

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint unique_call_summary unique(call_id)
);

-- Index
create index if not exists idx_call_summaries_call_id on public.call_summaries(call_id);
create index if not exists idx_call_summaries_author_id on public.call_summaries(author_id);

-- RLS
alter table public.call_summaries enable row level security;

-- Admin voit tout
create policy "admin_call_summaries_all" on public.call_summaries
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin'))
  );

-- Coach/Sales voit ses propres appels
create policy "coach_call_summaries_select" on public.call_summaries
  for select using (
    exists (
      select 1 from public.call_calendar cc
      where cc.id = call_summaries.call_id
      and (cc.assigned_to = auth.uid() or cc.client_id = auth.uid())
    )
  );

-- Coach peut creer/modifier ses syntheses
create policy "coach_call_summaries_insert" on public.call_summaries
  for insert with check (author_id = auth.uid());

create policy "coach_call_summaries_update" on public.call_summaries
  for update using (author_id = auth.uid());

-- Updated_at trigger
create or replace function update_call_summaries_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger call_summaries_updated_at
  before update on public.call_summaries
  for each row execute function update_call_summaries_updated_at();
