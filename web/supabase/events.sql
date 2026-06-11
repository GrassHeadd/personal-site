-- calendar events table: run once in the Supabase SQL editor
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  note text,
  color text not null default 'forest' check (color in ('forest', 'amber')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_date_idx on events (date);

-- seed: the two events that lived in constants/events.ts
insert into events (date, title, color) values
  ('2026-06-10', 'redesign the grasshut', 'forest'),
  ('2026-06-21', 'touch grass', 'amber');
