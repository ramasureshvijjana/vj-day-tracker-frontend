-- ============================================================================
-- Bloomday schema v2
-- Run this in the Supabase SQL Editor for a NEW project.
-- If you already ran the old schema.sql, use migration_003_v2_restructure.sql
-- instead — it drops the old tables and creates these from scratch
-- (this is a breaking change, old data is not carried over).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- DAILY_TASKS: items that repeat every day (Set Tasks -> "Daily Tasks" tab)
-- ============================================================
create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('activity', 'food', 'gym')),
  item text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create index if not exists daily_tasks_user_idx on public.daily_tasks (user_id);

-- ============================================================
-- ONE_TIME_TASKS: items scheduled for a single specific date
-- (Set Tasks -> "One-time Tasks" tab)
-- ============================================================
create table if not exists public.one_time_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('activity', 'food', 'gym')),
  item text not null,
  start_time time not null,
  end_time time not null,
  specific_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists one_time_tasks_user_date_idx on public.one_time_tasks (user_id, specific_date);

-- ============================================================
-- WEEKLY_TASKS: items that repeat only on chosen days of the week
-- (Set Tasks -> "Weekly Tasks" tab), e.g. gym on Mon/Wed/Fri.
-- ============================================================
create table if not exists public.weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('activity', 'food', 'gym')),
  item text not null,
  start_time time not null,
  end_time time not null,
  -- 0=Sunday .. 6=Saturday
  days_of_week int[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists weekly_tasks_user_idx on public.weekly_tasks (user_id);

-- ============================================================
-- HISTORY: one row per task, per calendar day. This is what the
-- Timetable page and Analytics are built from.
--
-- Deliberately has NO foreign key to daily_tasks/one_time_tasks/weekly_tasks:
-- rows here are self-contained copies (type/item/times), so deleting a
-- source task NEVER deletes or changes history rows. Once a row exists
-- here it is permanent — today/future generation only ever INSERTs new
-- rows, it never overwrites an existing one. Past days are read from this
-- table only and are never regenerated from the source tables.
-- ============================================================
create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('daily', 'one_time', 'weekly')),
  source_id uuid not null,
  type text not null check (type in ('activity', 'food', 'gym')),
  item text not null,
  start_time time not null,
  end_time time not null,
  log_date date not null,
  status text not null default 'pending' check (status in ('done', 'not_done', 'pending')),
  -- true = user removed just this one day's occurrence
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (source_type, source_id, log_date)
);

create index if not exists history_user_date_idx on public.history (user_id, log_date);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.daily_tasks enable row level security;
alter table public.weekly_tasks enable row level security;
alter table public.one_time_tasks enable row level security;
alter table public.history enable row level security;

create policy "Users manage their own daily tasks"
  on public.daily_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own weekly tasks"
  on public.weekly_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own one-time tasks"
  on public.one_time_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own history"
  on public.history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
