# Pulse

A private progress dashboard for the AI skills training programme:
11 sessions + 6 support visits over 12 months, 8 participants, two users.

- **Admin (the trainer)** — adds and edits sessions, marks attendance.
- **Viewer (the client's CEO)** — sees the same dashboard, read-only.

There is no sign-up. Both accounts are created by hand in Supabase, and
sign-in is a one-tap magic link.

## Stack

| Piece | What it does | Cost for 2 users |
| --- | --- | --- |
| Next.js 16 (App Router, TypeScript) | the app | free, open source |
| Supabase | Postgres + magic-link auth | free tier |
| Vercel | hosting, auto-deploys from GitHub | free Hobby tier |
| Tailwind CSS 4 | styling | free, open source |

Nothing here needs a paid plan at this size. Free-tier limits worth knowing:
a Supabase project pauses after ~1 week of no activity (one visit wakes it),
free-tier auth emails are rate-limited to a handful per hour (fine for two
people, and you can plug in your own SMTP later), and Vercel's Hobby tier is
for non-commercial personal use — an internal client dashboard is a grey area,
so if it matters, the Pro tier or Cloudflare Pages is the paid/free escape hatch.

## First-time setup

### 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste `supabase/migrations/0001_init.sql` → Run.
3. Open `supabase/seed.sql`, replace the two example emails with your address
   and the CEO's (and the participant names if you have them) → Run.
4. **Authentication → Providers → Email**: keep *Email* on, turn
   **"Confirm email"** on, and turn **"Allow new users to sign up"** OFF.
   That's belt-and-braces — the app also asks Supabase never to create users.
5. **Authentication → Users → Add user → Send invitation** for each of the two
   addresses in `allowed_users`. A trigger gives each one the role from that
   table, so add them to the allowlist *before* creating the users.

To change who is admin later: `update public.profiles set role = 'admin'
where email = '…';`

### 2. Local development

```bash
cp .env.example .env.local   # fill in URL + anon key from Supabase → Settings → API
npm install
npm run dev                  # http://localhost:3000
```

### 3. Deploy to Vercel

1. Push this repo to GitHub (private), then **Add New → Project** in Vercel.
2. **Root Directory: `pulse`** — this app lives in a subfolder of the repo.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
4. Deploy. Every push to the branch auto-deploys from then on.
5. In Supabase → **Authentication → URL Configuration**, set *Site URL* to the
   Vercel URL and add `https://<your-app>.vercel.app/auth/callback` to
   *Redirect URLs*. Magic links won't land anywhere useful until you do.

## How access is enforced

Two layers, so a mistake in one doesn't open the app up:

1. **Sign-in** — `signInWithOtp({ shouldCreateUser: false })`, so an unknown
   address gets no link, plus sign-up disabled in the Supabase dashboard.
2. **The database** — row-level security on every table. Reads require a row
   in `profiles`; writes require `role = 'admin'`. The viewer account
   physically cannot write, even if the UI were bypassed.

## Layout

```
app/
  (app)/            signed-in screens, wrapped by the auth guard + nav
    page.tsx          Dashboard — KPIs, attendance trend, participants
    sessions/         Session Log — list, add, edit
    attendance/       Attendance — fast per-session entry
    adoption/         Tool Adoption — level, tools, notes per participant
    assignments/      Assignments — per session, per participant
  login/            magic-link request screen
  auth/             callback + sign-out routes
components/         chart, nav, session picker, shared UI primitives
lib/
  data.ts           queries + the KPI/attendance maths
  auth.ts           current profile, admin guard
  config.ts         programme totals, tracks, statuses, adoption levels
  supabase/         server client + proxy session refresh
supabase/           schema migration and seed data
proxy.ts            refreshes the session, redirects signed-out visitors
```

## Everyday use

- **After a session**: Attendance → pick the session → everyone defaults to
  Present, tap anyone who missed it → Save. That also marks the session
  Completed unless you untick it.
- **Setting the homework**: Assignments → pick the session → type the task
  once and hit *Apply* to give it to everyone → Save.
- **Reviewing it**: same screen, tick people off (*Mark all complete* if the
  whole cohort did it). Ticking someone fills in today's review date.
- **Tool adoption**: edit any rows that have moved, save once. Everyone's
  level feeds the "Confident" KPI on the dashboard.
- **Schedule changes**: Session Log → Edit.
- The dashboard's *Last updated* line is the most recent edit to any
  programme data, so the CEO can see at a glance how current the picture is.

Editing the programme shape (11 sessions, 6 support visits) is two numbers in
`lib/config.ts`.

## Possible next steps

Not built, and not needed for the first version: email notifications, the
6 support visits tracked as their own records (only counted on the dashboard
today), and per-track breakdowns on the dashboard.
