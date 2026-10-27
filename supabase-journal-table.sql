-- Supabase SQL to create the journal_entries table
create extension if not exists "pgcrypto";

create table if not exists public.journal_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null,
    date date not null,
    mood text not null,
    symptoms text[] not null,
    medications text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for fast lookup by user_id and date
do $$
begin
  if not exists (select 1 from pg_indexes where tablename='journal_entries' and indexname='journal_entries_user_id_date_idx') then
    create index journal_entries_user_id_date_idx on public.journal_entries(user_id, date desc);
  end if;
end$$;
