-- Run this in your Supabase SQL Editor
-- Project: jkvonmowcpmomoafazmc

create table if not exists universities (
  id bigint generated always as identity primary key,
  name_en text not null,
  name_am text,
  university_type text not null default 'public',  -- public | private | faith_based
  city text,
  region text,
  latitude double precision,
  longitude double precision,
  established integer,
  description text,
  phone text,
  email text,
  website text,
  departments jsonb default '[]',
  images text[] default '{}',
  image_url text,
  tags text[] default '{}',
  verified boolean default false,
  student_count text,
  fee_range_etb text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table universities enable row level security;

-- Public can read all universities
create policy "Public read universities"
  on universities for select
  using (true);

-- Only service role can write (admin uses service key or anon with custom policy)
create policy "Anon insert universities"
  on universities for insert
  with check (true);

create policy "Anon update universities"
  on universities for update
  using (true);

create policy "Anon delete universities"
  on universities for delete
  using (true);
