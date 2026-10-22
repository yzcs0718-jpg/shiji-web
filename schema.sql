create extension if not exists pgcrypto;
create table if not exists public.bookmarks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 url text not null,
 platform text not null default 'other',
 category text not null default '未分类',
 created_at timestamptz not null default now(),
 constraint bookmarks_url_check check (length(url) between 1 and 4096),
 constraint bookmarks_title_check check (length(title) between 1 and 200),
 constraint bookmarks_category_check check (length(category) between 1 and 60),
 constraint bookmarks_unique_user_url unique (user_id,url)
);
create index if not exists bookmarks_user_date on public.bookmarks(user_id,created_at desc);
alter table public.bookmarks enable row level security;
revoke all on public.bookmarks from anon;
grant select,insert,update,delete on public.bookmarks to authenticated;
drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own" on public.bookmarks for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks for delete to authenticated using ((select auth.uid())=user_id);
