-- Run in Supabase SQL Editor. Keep provider credentials server-side only.
create table if not exists public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('douyin','xiaohongshu','bilibili')),
  platform_user_id text,
  display_name text,
  status text not null default 'pending' check (status in ('pending','connected','expired','disconnected')),
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,provider)
);
alter table public.platform_connections enable row level security;
revoke all on public.platform_connections from anon;
grant select on public.platform_connections to authenticated;
drop policy if exists platform_connections_own_select on public.platform_connections;
create policy platform_connections_own_select on public.platform_connections
  for select to authenticated using ((select auth.uid())=user_id);
-- No direct insert/update/delete grant to browser. Bindings must be written by server after verified OAuth.
