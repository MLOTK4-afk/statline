-- Statline schema for Supabase.
-- Safe to run multiple times (idempotent) -- re-running it after a partial
-- or full previous run will not error. Run in your project's SQL Editor
-- (Supabase dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- No Supabase Auth is used in this app. NextAuth (admin login only) stays
-- entirely on the app's local JSON storage -- admin credentials never enter
-- Postgres, so there's no password-hash table exposed to the public
-- anon/publishable key. Every table below is owned by an anonymous
-- device-token cookie (owner_token), not a real user id, since the app
-- allows anonymous form submission everywhere (building a profile,
-- starring, coach boards, saved searches, recruiting board).

-- ---------------------------------------------------------------------------
-- athletes  (this is the table profile-builder submissions write to)
-- ---------------------------------------------------------------------------
create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  owner_token text,
  level text not null check (level in ('youth', 'high-school', 'college', 'independent')),
  sport text not null,
  name text not null,
  jersey_number text,
  region text not null,
  grad_year text,
  height_weight text,
  positions text,
  gpa text,
  stats jsonb not null default '{}'::jsonb,
  highlight_url text,
  banner_url text,
  achievements text[] not null default '{}',
  contact_email text not null,
  contact_phone text,
  committed boolean not null default false,
  committed_school text,
  published boolean not null default true,
  is_international boolean not null default false,
  international jsonb,
  scouting_report jsonb,
  division_match jsonb,
  team text,
  combine jsonb,
  combine_verified boolean not null default false,
  endorsement jsonb,
  previous_season_stats text,
  target_schools text[],
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athletes_owner_token_idx on public.athletes (owner_token);
create index if not exists athletes_published_idx on public.athletes (published, is_international);
create index if not exists athletes_sport_idx on public.athletes (sport);

-- Idempotent column add for databases created before banner_url existed --
-- the create table above only runs on a fresh install.
alter table public.athletes add column if not exists banner_url text;

-- ---------------------------------------------------------------------------
-- scouting_boards + board_cards (coach kanban boards)
-- ---------------------------------------------------------------------------
create table if not exists public.scouting_boards (
  id uuid primary key default gen_random_uuid(),
  owner_token text not null,
  name text not null,
  is_default boolean not null default false,
  share_token uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scouting_boards_owner_token_idx on public.scouting_boards (owner_token);

create table if not exists public.board_cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.scouting_boards (id) on delete cascade,
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  column_key text not null check (column_key in ('toContact', 'contacted', 'replied', 'offerReceived')),
  note text,
  added_at timestamptz not null default now(),
  unique (board_id, athlete_id)
);

create index if not exists board_cards_board_id_idx on public.board_cards (board_id);
create index if not exists board_cards_athlete_id_idx on public.board_cards (athlete_id);

-- ---------------------------------------------------------------------------
-- recruiting_programs (international "My Recruiting Board" CRM)
-- ---------------------------------------------------------------------------
create table if not exists public.recruiting_programs (
  id uuid primary key default gen_random_uuid(),
  owner_token text not null,
  school_name text not null,
  division text not null check (division in ('D1', 'D2', 'D3', 'NAIA', 'JUCO')),
  coach_name text,
  coach_email text,
  notes text,
  stage text not null check (stage in ('toContact', 'contacted', 'replied', 'offerReceived')),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recruiting_programs_owner_token_idx on public.recruiting_programs (owner_token);

-- ---------------------------------------------------------------------------
-- saved_searches, stars, follows: anonymous per-visitor state
-- ---------------------------------------------------------------------------
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  owner_token text not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists saved_searches_owner_token_idx on public.saved_searches (owner_token);

create table if not exists public.stars (
  owner_token text not null,
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_token, athlete_id)
);

create index if not exists stars_athlete_id_idx on public.stars (athlete_id);

create table if not exists public.follows (
  owner_token text not null,
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_token, athlete_id)
);

create index if not exists follows_athlete_id_idx on public.follows (athlete_id);

-- ---------------------------------------------------------------------------
-- analytics_events
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  type text not null,
  meta jsonb,
  ts timestamptz not null default now()
);

create index if not exists analytics_events_type_idx on public.analytics_events (type);
create index if not exists analytics_events_ts_idx on public.analytics_events (ts desc);

-- ---------------------------------------------------------------------------
-- division_benchmarks
--
-- Reference data for the Fit Score feature (lib/fitScore.ts) -- deterministic
-- median/p75 stat thresholds per sport+division, scored against consistently
-- to keep athletes comparable to one another (see lib/fitScore.ts comments).
--
-- ESTIMATES: every row seeded below is a rough placeholder, not verified
-- recruiting data. Replace with real benchmark numbers before relying on
-- Fit Score for anything beyond an illustrative estimate.
-- ---------------------------------------------------------------------------
create table if not exists public.division_benchmarks (
  id bigint generated always as identity primary key,
  sport text not null,
  division text not null check (division in ('D1', 'D2', 'D3', 'NAIA', 'JUCO')),
  stat_name text not null,
  median_value numeric not null,
  p75_value numeric not null,
  unique (sport, division, stat_name)
);

create index if not exists division_benchmarks_sport_idx on public.division_benchmarks (sport);

-- Placeholder seed data (estimates only -- see comment above).
insert into public.division_benchmarks (sport, division, stat_name, median_value, p75_value) values
  ('Football', 'D1', 'gpa', 3.2, 3.6),
  ('Football', 'D1', 'forty_yard_dash', 4.6, 4.45),
  ('Football', 'D1', 'weight_lb', 210, 235),
  ('Wrestling', 'D1', 'gpa', 3.1, 3.5),
  ('Wrestling', 'D1', 'win_percentage', 75, 88),
  ('Wrestling', 'D1', 'weight_lb', 157, 174),
  ('Track & Field', 'D1', 'gpa', 3.3, 3.7),
  ('Track & Field', 'D1', 'sprint_time_100m', 11.2, 10.7),
  ('Soccer', 'D1', 'gpa', 3.3, 3.6),
  ('Soccer', 'D1', 'goals_per_season', 8, 15),
  ('Swimming', 'D1', 'gpa', 3.4, 3.8),
  ('Swimming', 'D1', 'freestyle_100m_time', 50.5, 47.8)
on conflict (sport, division, stat_name) do nothing;

-- ---------------------------------------------------------------------------
-- momentum_cache
--
-- One row per athlete holding the last computed Recruiting Momentum result
-- (lib/momentum.ts). Recomputed at most once a day -- by a Vercel Cron hit
-- to /api/cron/momentum, or lazily by /api/momentum if the cached row is
-- missing or stale -- rather than on every profile/dashboard load.
-- ---------------------------------------------------------------------------
create table if not exists public.momentum_cache (
  athlete_id uuid primary key references public.athletes (id) on delete cascade,
  label text not null check (label in ('Rising', 'Steady', 'Cooling')),
  trend_percent numeric not null,
  computed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: enabled everywhere. No Supabase Auth session ever exists in this app,
-- so ownership (owner_token match) is enforced in the Next.js API routes,
-- not in these policies -- policies are permissive for the anon role, which
-- is the only Postgres role every request uses. Policies are dropped and
-- recreated each run since Postgres has no "create policy if not exists".
-- ---------------------------------------------------------------------------
alter table public.athletes enable row level security;
alter table public.scouting_boards enable row level security;
alter table public.board_cards enable row level security;
alter table public.recruiting_programs enable row level security;
alter table public.saved_searches enable row level security;
alter table public.stars enable row level security;
alter table public.follows enable row level security;
alter table public.analytics_events enable row level security;
alter table public.division_benchmarks enable row level security;
alter table public.momentum_cache enable row level security;

drop policy if exists "athletes_all" on public.athletes;
create policy "athletes_all" on public.athletes for all to anon using (true) with check (true);

drop policy if exists "scouting_boards_all" on public.scouting_boards;
create policy "scouting_boards_all" on public.scouting_boards for all to anon using (true) with check (true);

drop policy if exists "board_cards_all" on public.board_cards;
create policy "board_cards_all" on public.board_cards for all to anon using (true) with check (true);

drop policy if exists "recruiting_programs_all" on public.recruiting_programs;
create policy "recruiting_programs_all" on public.recruiting_programs for all to anon using (true) with check (true);

drop policy if exists "saved_searches_all" on public.saved_searches;
create policy "saved_searches_all" on public.saved_searches for all to anon using (true) with check (true);

drop policy if exists "stars_all" on public.stars;
create policy "stars_all" on public.stars for all to anon using (true) with check (true);

drop policy if exists "follows_all" on public.follows;
create policy "follows_all" on public.follows for all to anon using (true) with check (true);

drop policy if exists "analytics_events_all" on public.analytics_events;
create policy "analytics_events_all" on public.analytics_events for all to anon using (true) with check (true);

-- Reference data, not owner_token-scoped -- read-only for the anon role.
-- Writes happen from the SQL editor / admin tooling, not the app itself.
drop policy if exists "division_benchmarks_select" on public.division_benchmarks;
create policy "division_benchmarks_select" on public.division_benchmarks for select to anon using (true);

drop policy if exists "momentum_cache_all" on public.momentum_cache;
create policy "momentum_cache_all" on public.momentum_cache for all to anon using (true) with check (true);

-- ---------------------------------------------------------------------------
-- athlete-banners storage bucket (profile banner photo uploads)
--
-- Public read (so the image renders on the public profile page), permissive
-- anon write -- same pattern as every other table in this file: ownership
-- (owner_token match) is enforced in the Next.js API route
-- (app/api/athletes/[id]/banner/route.ts), not in these policies.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('athlete-banners', 'athlete-banners', true)
on conflict (id) do nothing;

drop policy if exists "athlete_banners_select" on storage.objects;
create policy "athlete_banners_select" on storage.objects
  for select to anon using (bucket_id = 'athlete-banners');

drop policy if exists "athlete_banners_insert" on storage.objects;
create policy "athlete_banners_insert" on storage.objects
  for insert to anon with check (bucket_id = 'athlete-banners');

drop policy if exists "athlete_banners_update" on storage.objects;
create policy "athlete_banners_update" on storage.objects
  for update to anon using (bucket_id = 'athlete-banners');

drop policy if exists "athlete_banners_delete" on storage.objects;
create policy "athlete_banners_delete" on storage.objects
  for delete to anon using (bucket_id = 'athlete-banners');
