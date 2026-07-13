-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

-- ============================================================
-- TEMPLATES: the "set tasks" schedule setup, one row per item
-- ============================================================
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('task', 'food', 'gym')),
  item text not null,
  start_time time not null,
  end_time time not null,
  recurrence text not null default 'daily' check (recurrence in ('once', 'daily', 'weekly', 'custom')),
  -- 0=Sunday .. 6=Saturday, used when recurrence is 'weekly' or 'custom'
  days_of_week int[] not null default '{}',
  -- used when recurrence = 'once'
  specific_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists templates_user_category_idx on public.templates (user_id, category);

-- ============================================================
-- TASK_LOGS: one row per template per calendar day, holds the
-- done / not_done / pending status shown on the merged Timetable page
-- ============================================================
create table if not exists public.task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete cascade,
  category text not null check (category in ('task', 'food', 'gym')),
  item text not null,
  start_time time not null,
  end_time time not null,
  log_date date not null,
  status text not null default 'pending' check (status in ('done', 'not_done', 'pending')),
  created_at timestamptz not null default now(),
  unique (template_id, log_date)
);

create index if not exists task_logs_user_date_idx on public.task_logs (user_id, log_date);

-- ============================================================
-- Row Level Security
-- (The FastAPI backend uses the service-role key, which bypasses RLS
-- and enforces user_id filtering in application code. RLS is enabled
-- here as defense-in-depth / in case the frontend ever calls Supabase directly.)
-- ============================================================
alter table public.templates enable row level security;
alter table public.task_logs enable row level security;

create policy "Users manage their own templates"
  on public.templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own task logs"
  on public.task_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
