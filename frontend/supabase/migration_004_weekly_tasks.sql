-- ============================================================================
-- Migration: adds the "Weekly Tasks" (specific days of the week) feature.
-- Run this ONCE in the Supabase SQL Editor if your project already has the
-- v2 schema (daily_tasks / one_time_tasks / history). Safe to re-run.
-- ============================================================================

create table if not exists public.weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('activity', 'food', 'gym')),
  item text not null,
  start_time time not null,
  end_time time not null,
  days_of_week int[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists weekly_tasks_user_idx on public.weekly_tasks (user_id);

alter table public.weekly_tasks enable row level security;

drop policy if exists "Users manage their own weekly tasks" on public.weekly_tasks;
create policy "Users manage their own weekly tasks"
  on public.weekly_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow history rows to be sourced from weekly_tasks too.
alter table public.history drop constraint if exists history_source_type_check;
alter table public.history add constraint history_source_type_check
  check (source_type in ('daily', 'one_time', 'weekly'));
