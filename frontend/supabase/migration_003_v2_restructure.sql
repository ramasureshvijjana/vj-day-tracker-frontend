-- ============================================================================
-- Migration to Bloomday schema v2.
-- Run this ONCE in the Supabase SQL Editor if your project already has the
-- old `templates` / `task_logs` tables.
--
-- WARNING: this is a breaking restructure (3 categories -> 2 sections +
-- a "type" field, plus a dedicated immutable history table). Your old
-- schedule setup and logged history are NOT carried over automatically.
-- If you need the old data, export it first (Table Editor -> export CSV)
-- before running this.
-- ============================================================================

drop table if exists public.task_logs cascade;
drop table if exists public.templates cascade;

-- Now run schema.sql (the full v2 script) to create daily_tasks,
-- one_time_tasks and history.
