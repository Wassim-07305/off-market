-- Dashboard widget layouts per user
create table if not exists public.dashboard_layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  widgets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint dashboard_layouts_user_id_key unique (user_id)
);

-- Index for fast lookup by user
create index if not exists idx_dashboard_layouts_user_id on public.dashboard_layouts(user_id);

-- RLS
alter table public.dashboard_layouts enable row level security;

create policy "Users can view own dashboard layout"
  on public.dashboard_layouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own dashboard layout"
  on public.dashboard_layouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own dashboard layout"
  on public.dashboard_layouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own dashboard layout"
  on public.dashboard_layouts for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_dashboard_layout_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_dashboard_layout_update
  before update on public.dashboard_layouts
  for each row
  execute function public.handle_dashboard_layout_updated_at();
