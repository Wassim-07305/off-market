-- Migration 041: Branding Settings (white-label)
-- Personnalisation de l'apparence de la plateforme

create table if not exists public.branding_settings (
  id uuid primary key default gen_random_uuid(),
  app_name text not null default 'Off Market',
  logo_url text,                              -- URL du logo custom (Supabase Storage)
  favicon_url text,                           -- URL du favicon custom
  primary_color text not null default '#c41e3a',
  primary_color_dark text not null default '#e8374e',
  accent_color text not null default '#f97316',
  accent_color_dark text not null default '#fb923c',
  font_family text not null default 'Inter',  -- Inter, Poppins, DM Sans, Plus Jakarta Sans
  border_radius text not null default '12',   -- base radius in px
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Single row — enforce with constraint
create unique index if not exists idx_branding_singleton on public.branding_settings ((true));

-- Insert default row
insert into public.branding_settings (app_name) values ('Off Market')
on conflict do nothing;

-- RLS
alter table public.branding_settings enable row level security;

-- Everyone can read branding (needed for login page, public pages)
create policy "branding_select_all" on public.branding_settings
  for select using (true);

-- Only admin can update
create policy "branding_update_admin" on public.branding_settings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Updated_at trigger
create or replace function update_branding_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger branding_updated_at
  before update on public.branding_settings
  for each row execute function update_branding_updated_at();

-- Create storage bucket for branding assets
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict do nothing;

-- Public read access for branding bucket
create policy "branding_public_read" on storage.objects
  for select using (bucket_id = 'branding');

-- Admin can upload to branding bucket
create policy "branding_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "branding_admin_update" on storage.objects
  for update using (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "branding_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
