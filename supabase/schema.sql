-- Run this once in your Supabase project's SQL Editor (Database → SQL Editor → New query).
-- It creates the shared question-bank table and opens it up for anyone to read/insert,
-- matching the "open — anyone can upload & everyone sees it" access model.

create table if not exists public.question_banks (
  id uuid primary key default gen_random_uuid(),
  course_name text not null,
  filename text,
  questions jsonb not null,
  question_count int generated always as (jsonb_array_length(questions)) stored,
  created_at timestamptz not null default now()
);

alter table public.question_banks enable row level security;

-- Anyone (including anonymous visitors using the public anon key) can read banks.
create policy "Anyone can read question banks"
  on public.question_banks for select
  to anon, authenticated
  using (true);

-- Anyone can upload a new bank. There's no per-row ownership since uploads are anonymous.
create policy "Anyone can insert question banks"
  on public.question_banks for insert
  to anon, authenticated
  with check (true);

-- No update/delete policy is created, so existing shared banks can't be
-- edited or removed through the anon key — only via the Supabase dashboard.
