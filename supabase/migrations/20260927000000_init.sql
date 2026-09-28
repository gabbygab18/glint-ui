-- Glint UI schema.
-- Component content lives in the repo (static, CDN-served). The database only
-- holds what changes at runtime: engagement counters and user favorites.

-- ─── Counters ──────────────────────────────────────────────────────────────
create table public.component_stats (
  slug       text primary key check (slug ~ '^[a-z0-9-]{1,64}$'),
  views      bigint not null default 0,
  copies     bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.component_stats enable row level security;
-- No policies: clients never touch this table directly. Reads and writes go
-- through the functions below, called by the server with the secret key.

-- ─── Favorites ─────────────────────────────────────────────────────────────
create table public.favorites (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug       text not null check (slug ~ '^[a-z0-9-]{1,64}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);

-- PK covers lookups by user; this one serves the per-component counts.
create index favorites_slug_idx on public.favorites (slug);

alter table public.favorites enable row level security;

create policy "Users read their own favorites"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add their own favorites"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users remove their own favorites"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ─── Functions ─────────────────────────────────────────────────────────────
-- ponytail: one row per slug takes a row lock per increment. Fine into the
-- thousands of events/sec per component; beyond that, buffer events and flush
-- in batches (e.g. a queue + cron) instead of incrementing per request.
create function public.track_event(p_slug text, p_event text)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.component_stats as s (slug, views, copies)
  values (p_slug, (p_event = 'view')::int, (p_event = 'copy')::int)
  on conflict (slug) do update
    set views      = s.views  + excluded.views,
        copies     = s.copies + excluded.copies,
        updated_at = now();
$$;

create function public.get_stats()
returns table (slug text, views bigint, copies bigint, favorites bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(s.slug, f.slug),
         coalesce(s.views, 0),
         coalesce(s.copies, 0),
         coalesce(f.n, 0)
  from public.component_stats s
  full join (select slug, count(*) as n from public.favorites group by slug) f
    on f.slug = s.slug;
$$;

revoke execute on function public.track_event(text, text) from public, anon, authenticated;
revoke execute on function public.get_stats() from public, anon, authenticated;
grant execute on function public.track_event(text, text) to service_role;
grant execute on function public.get_stats() to service_role;
