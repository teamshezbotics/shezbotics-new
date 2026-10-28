-- Pulse — seed data. Edit the two emails, then run once after 0001_init.sql.

-- 1) The allowlist. These are the ONLY addresses that can ever have access.
insert into public.allowed_users (email, role) values
  ('trainer@example.com', 'admin'),   -- you
  ('ceo@example.com',     'viewer')   -- the client's CEO
on conflict (email) do update set role = excluded.role;

-- 2) The eight participants. Replace with the real cohort.
insert into public.participants (name, track, role) values
  ('Participant 1', 'Sales & BD',          'Business Development Exec'),
  ('Participant 2', 'Sales & BD',          'Account Manager'),
  ('Participant 3', 'Sales & BD',          'Sales Lead'),
  ('Participant 4', 'Finance & Accounts',  'Financial Accountant'),
  ('Participant 5', 'Finance & Accounts',  'Accounts Assistant'),
  ('Participant 6', 'Operations & Admin',  'Operations Manager'),
  ('Participant 7', 'Operations & Admin',  'Office Administrator'),
  ('Participant 8', 'Operations & Admin',  'Logistics Coordinator');

-- 3) The 11 sessions, unscheduled and unopinionated about topics.
insert into public.sessions (number, topic, hours, status) values
  (1,  'Session 1',  3, 'Upcoming'),
  (2,  'Session 2',  3, 'Upcoming'),
  (3,  'Session 3',  3, 'Upcoming'),
  (4,  'Session 4',  3, 'Upcoming'),
  (5,  'Session 5',  3, 'Upcoming'),
  (6,  'Session 6',  3, 'Upcoming'),
  (7,  'Session 7',  3, 'Upcoming'),
  (8,  'Session 8',  3, 'Upcoming'),
  (9,  'Session 9',  3, 'Upcoming'),
  (10, 'Session 10', 3, 'Upcoming'),
  (11, 'Session 11', 3, 'Upcoming')
on conflict (number) do nothing;

-- 4) An adoption row per participant, so the dashboard has a baseline.
insert into public.tool_adoption (participant_id, level)
select id, 'Not Started' from public.participants
on conflict (participant_id) do nothing;
