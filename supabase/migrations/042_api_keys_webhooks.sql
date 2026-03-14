-- Migration 042: API Keys & Webhooks

-- ═══════════════════════════════════════
-- API Keys
-- ═══════════════════════════════════════
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_hash text not null,          -- SHA-256 hash of the key (never store plaintext)
  key_prefix text not null,        -- First 8 chars for identification (e.g., "om_live_abc12345...")
  scopes text[] not null default '{"read"}', -- read, write, admin
  is_active boolean not null default true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_api_keys_hash on public.api_keys(key_hash);
create index if not exists idx_api_keys_owner on public.api_keys(owner_id);

alter table public.api_keys enable row level security;

create policy "api_keys_admin_all" on public.api_keys
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "api_keys_owner_select" on public.api_keys
  for select using (owner_id = auth.uid());

-- ═══════════════════════════════════════
-- Webhooks
-- ═══════════════════════════════════════
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  secret text not null,           -- Shared secret for HMAC signature
  events text[] not null default '{}', -- client.created, lead.updated, call.completed, etc.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_webhooks_owner on public.webhooks(owner_id);

alter table public.webhooks enable row level security;

create policy "webhooks_admin_all" on public.webhooks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ═══════════════════════════════════════
-- Webhook delivery logs
-- ═══════════════════════════════════════
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references public.webhooks(id) on delete cascade,
  event text not null,
  payload jsonb not null default '{}',
  response_status integer,
  response_body text,
  duration_ms integer,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_webhook_logs_webhook on public.webhook_logs(webhook_id);
create index if not exists idx_webhook_logs_created on public.webhook_logs(created_at desc);

alter table public.webhook_logs enable row level security;

create policy "webhook_logs_admin_all" on public.webhook_logs
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Updated_at trigger for webhooks
create or replace function update_webhooks_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger webhooks_updated_at
  before update on public.webhooks
  for each row execute function update_webhooks_updated_at();
