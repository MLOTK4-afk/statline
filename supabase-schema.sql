-- Statline schema for Supabase.
-- Run this once in your project's SQL Editor (Supabase dashboard ->
-- SQL Editor -> New query -> paste -> Run).
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
create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  owner_token text,
  level text not null check (level in ('high-school', 'college', 'pro')),
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

create index athletes_owner_token_idx on public.athletes (owner_token);
create index athletes_published_idx on public.athletes (published, is_international);
create index athletes_sport_idx on public.athletes (sport);

-- ---------------------------------------------------------------------------
-- scouting_boards + board_cards (coach kanban boards)
-- ---------------------------------------------------------------------------
create table public.scouting_boards (
  id uuid primary key default gen_random_uuid(),
  owner_token text not null,
  name text not null,
  is_default boolean not null default false,
  share_token uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scouting_boards_owner_token_idx on public.scouting_boards (owner_token);

create table public.board_cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.scouting_boards (id) on delete cascade,
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  column_key text not null check (column_key in ('toContact', 'contacted', 'replied', 'offerReceived')),
  note text,
  added_at timestamptz not null default now(),
  unique (board_id, athlete_id)
);

create index board_cards_board_id_idx on public.board_cards (board_id);
create index board_cards_athlete_id_idx on public.board_cards (athlete_id);

-- ---------------------------------------------------------------------------
-- recruiting_programs (international "My Recruiting Board" CRM)
-- ---------------------------------------------------------------------------
create table public.recruiting_programs (
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

create index recruiting_programs_owner_token_idx on public.recruiting_programs (owner_token);

-- ---------------------------------------------------------------------------
-- saved_searches, stars, follows: anonymous per-visitor state
-- ---------------------------------------------------------------------------
create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  owner_token text not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index saved_searches_owner_token_idx on public.saved_searches (owner_token);

create table public.stars (
  owner_token text not null,
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_token, athlete_id)
);

create index stars_athlete_id_idx on public.stars (athlete_id);

create table public.follows (
  owner_token text not null,
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_token, athlete_id)
);

create index follows_athlete_id_idx on public.follows (athlete_id);

-- ---------------------------------------------------------------------------
-- analytics_events
-- ---------------------------------------------------------------------------
create table public.analytics_events (
  id bigint generated always as identity primary key,
  type text not null,
  meta jsonb,
  ts timestamptz not null default now()
);

create index analytics_events_type_idx on public.analytics_events (type);
create index analytics_events_ts_idx on public.analytics_events (ts desc);

-- ---------------------------------------------------------------------------
-- RLS: enabled everywhere. No Supabase Auth session ever exists in this app,
-- so ownership (owner_token match) is enforced in the Next.js API routes,
-- not in these policies -- policies are permissive for the anon role, which
-- is the only Postgres role every request uses.
-- ---------------------------------------------------------------------------
alter table public.athletes enable row level security;
alter table public.scouting_boards enable row level security;
alter table public.board_cards enable row level security;
alter table public.recruiting_programs enable row level security;
alter table public.saved_searches enable row level security;
alter table public.stars enable row level security;
alter table public.follows enable row level security;
alter table public.analytics_events enable row level security;

create policy "athletes_all" on public.athletes for all to anon using (true) with check (true);
create policy "scouting_boards_all" on public.scouting_boards for all to anon using (true) with check (true);
create policy "board_cards_all" on public.board_cards for all to anon using (true) with check (true);
create policy "recruiting_programs_all" on public.recruiting_programs for all to anon using (true) with check (true);
create policy "saved_searches_all" on public.saved_searches for all to anon using (true) with check (true);
create policy "stars_all" on public.stars for all to anon using (true) with check (true);
create policy "follows_all" on public.follows for all to anon using (true) with check (true);
create policy "analytics_events_all" on public.analytics_events for all to anon using (true) with check (true);
