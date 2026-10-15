# gymbro-web

Owner Dashboard — React + TypeScript (Vite), covering doc sections 4.1–4.9 plus
the owner side of class booking (5.6) and support (5.8).

## Setup

1. Create a Supabase project. For real OTP you'd enable **Phone** or **Email**
   auth and an OTP delivery provider; for local dev the **"Continue without OTP
   (dev)"** button on the login screen bypasses that entirely (backed by
   `POST /dev/login` on the API, which is only mounted when
   `NODE_ENV !== "production"`).
2. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
   from Supabase Settings > API. Point `VITE_API_BASE_URL` at your running
   `gymbro-backend` (default `http://localhost:4000`).
3. `npm install`
4. `npm run dev`

## Flow

- New owner: login → onboarding form (`POST /auth/bootstrap-owner`) → dashboard.
- Returning owner: login → dashboard (gym profile fetched via `GET /gyms/me`).
- The gym's join code/QR (its `checkinToken`) is shown on the Attendance page —
  share it with members so they can join via the mobile app and check in.

## Reports & Analytics (doc 4.7)

The **Reports** page (`/reports`) shows:

- **Revenue** — bar chart, monthly (last 12 months) or yearly (last 5 years)
  toggle, summing `PAID` payments per period.
- **New members per month** — line chart, last 12 months, by `joiningDate`.
- **Retention** — single stat: of members who have paid at least once, the share
  who have paid 2+ times (renewed at least once).

Charts use Recharts; the backend does the bucketing in
`gymbro-backend/src/routes/reports.ts`.

## Notifications (doc 4.8)

The **Notifications** page (`/notifications`) lets the owner send a gym-wide
announcement (title + message) and delete past ones. Members see these in the
mobile app's **Alerts** tab, with an unread badge until they open it.
Backend: `gymbro-backend/src/routes/notifications.ts`.

## Trainers & Workout Plans (doc 4.6 / 5.3)

- **Trainers** page (`/trainers`) — add/edit/remove trainers (name, specialty,
  phone). Trainers are gym-owned records, not login accounts.
- A member's detail page has a **Trainer** dropdown to assign one, and an
  **Edit workout plan** link to `/members/:id/workout` — a day-by-day editor
  (title, days, exercises with sets/reps/notes). One plan per member, saved
  wholesale via `PUT /workouts/member/:memberId`.
- Members see their trainer on the mobile Home screen and their plan in the
  mobile **Workout** tab.
Backend: `gymbro-backend/src/routes/trainers.ts`, `.../workouts.ts`.

## Class Booking (doc 5.6)

The **Classes** page (`/classes`) — create class sessions (title, description,
trainer, start time, duration, capacity), see upcoming ones with a live
booked/capacity count (click it for the roster), and delete. Members book/cancel
from the mobile **Classes** tab; capacity is enforced server-side in a
transaction. Backend: `gymbro-backend/src/routes/classes.ts`.

## Support (doc 5.8)

The **Support** page (`/support`) is the owner's inbox of member message threads
(Open / All filter). Open a thread to see the conversation, reply, and mark it
resolved (a member replying to a resolved thread reopens it). Members start and
continue threads from the mobile app's Support screen. Backend:
`gymbro-backend/src/routes/support.ts`.
