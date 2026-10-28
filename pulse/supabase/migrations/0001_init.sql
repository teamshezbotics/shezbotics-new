-- Pulse — schema, access rules and role plumbing.
-- Run this once in the Supabase SQL editor (see README).

-- ---------------------------------------------------------------- reference

create type public.track as enum (
  'Sales & BD', 'Finance & Accounts', 'Operations & Admin'
);
create type public.session_status as enum (
  'Upcoming', 'Completed', 'Rescheduled'
);
create type public.adoption_level as enum (
  'Not Started', 'Beginner', 'Practicing', 'Confident'
);
create type public.app_role as enum ('admin', 'viewer');

-- --------------------------------------------------------------- who is who

-- The allowlist is the gate: an address must be listed here BEFORE its user
-- is created, or the new user gets no profile and therefore no access.
create table public.allowed_users (
  email text primary key,
  role public.app_role not null default 'viewer'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now()
);

-- New auth user -> profile, with the role taken from the allowlist.
-- Not on the allowlist means no profile row, which means no data access.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed public.allowed_users;
begin
  select * into allowed
  from public.allowed_users
  where email = lower(new.email);

  if allowed.email is null then
    return new;
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, lower(new.email), allowed.role)
  on conflict (id) do update set role = excluded.role;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ------------------------------------------------------------ programme data

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  track public.track not null,
  role text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique,
  date date,
  topic text not null,
  hours numeric(4, 1),
  status public.session_status not null default 'Upcoming',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  present boolean not null,
  updated_at timestamptz not null default now(),
  unique (session_id, participant_id)
);
create index attendance_session_idx on public.attendance (session_id);
create index attendance_participant_idx on public.attendance (participant_id);

create table public.tool_adoption (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null unique
    references public.participants (id) on delete cascade,
  primary_tools text[] not null default '{}',
  level public.adoption_level not null default 'Not Started',
  last_active date,
  notes text,
  updated_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  task text,
  completed boolean not null default false,
  date_reviewed date,
  notes text,
  updated_at timestamptz not null default now(),
  unique (session_id, participant_id)
);
create index assignments_session_idx on public.assignments (session_id);

-- Keep updated_at honest without the app having to remember.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_participants before update on public.participants
  for each row execute function public.touch_updated_at();
create trigger touch_sessions before update on public.sessions
  for each row execute function public.touch_updated_at();
create trigger touch_attendance before update on public.attendance
  for each row execute function public.touch_updated_at();
create trigger touch_tool_adoption before update on public.tool_adoption
  for each row execute function public.touch_updated_at();
create trigger touch_assignments before update on public.assignments
  for each row execute function public.touch_updated_at();

-- One row, one column: the freshest edit anywhere in the programme data.
create view public.last_updated
with (security_invoker = true) as
select greatest(
  coalesce((select max(updated_at) from public.sessions), 'epoch'),
  coalesce((select max(updated_at) from public.attendance), 'epoch'),
  coalesce((select max(updated_at) from public.tool_adoption), 'epoch'),
  coalesce((select max(updated_at) from public.assignments), 'epoch'),
  coalesce((select max(updated_at) from public.participants), 'epoch')
) as at;

-- ------------------------------------------------------------------ security

alter table public.allowed_users enable row level security;
alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.tool_adoption enable row level security;
alter table public.assignments enable row level security;

-- No policies on allowed_users: it is service-role / SQL-editor only.

create policy "members read profiles" on public.profiles
  for select to authenticated using (public.is_member());

-- Both accounts read everything; only the admin writes.
do $$
declare t text;
begin
  foreach t in array array[
    'participants', 'sessions', 'attendance', 'tool_adoption', 'assignments'
  ]
  loop
    execute format(
      'create policy "members read" on public.%I
         for select to authenticated using (public.is_member())', t);
    execute format(
      'create policy "admin inserts" on public.%I
         for insert to authenticated with check (public.is_admin())', t);
    execute format(
      'create policy "admin updates" on public.%I
         for update to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
    execute format(
      'create policy "admin deletes" on public.%I
         for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;
