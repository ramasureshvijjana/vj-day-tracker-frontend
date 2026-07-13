# Bloomday — Daily Timetable Tracker

A full-stack daily tracking app: **task / food / gym** schedule setup, a merged daily
timetable with done / not-done marking, and an analytics dashboard (daily / weekly /
quarterly / yearly). Built with **FastAPI + Supabase (Postgres + Auth) + React (Vite)**,
deployable on **Render**.

## 1. Project structure

```
timetable-app/
├── backend/            FastAPI service
│   ├── main.py
│   ├── database.py     Supabase client (service role)
│   ├── auth.py         Verifies Supabase JWT -> user_id
│   ├── schemas.py
│   ├── routers/
│   │   ├── templates.py    CRUD for the 3 schedule setups (task/food/gym)
│   │   ├── timetable.py    Merged daily view + done/not-done toggle
│   │   └── analytics.py    daily/weekly/quarterly/yearly aggregation
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
├── frontend/            React (Vite) app
│   ├── src/
│   │   ├── pages/ (SetTasks, TimeTable, Analytics, Login)
│   │   ├── components/ (Sidebar, TaskForm, TaskList)
│   │   ├── api.js, supabaseClient.js
│   │   └── index.css   design system (mint + lavender theme)
│   ├── package.json
│   ├── render.yaml
│   └── .env.example
└── supabase/
    └── schema.sql       Run this once in the Supabase SQL editor
```

## 2. How the pieces fit together

- **Supabase** provides Postgres (two tables: `templates`, `task_logs`) and email/password
  Auth. Row Level Security is enabled as defense-in-depth.
- **FastAPI** talks to Supabase with the **service role key** and always filters by the
  `user_id` extracted from the caller's Supabase access token (sent as
  `Authorization: Bearer <token>` from the frontend).
- **React** signs users in via `@supabase/supabase-js`, then calls the FastAPI backend
  with axios (`src/api.js` auto-attaches the current session token).

### Data model

- `templates` — the schedule **setup**: one row per item you configure on the *Set Tasks*
  page, with `category` (`task`/`food`/`gym`), `item`, `start_time`, `end_time`,
  `recurrence` (`daily` / `weekly` / `once`), `days_of_week` (for weekly), and
  `specific_date` (for one-time items).
- `task_logs` — one row **per calendar day** that a template applies to. This is what
  powers the merged *Timetable* page and the done/not-done status. Rows are generated
  automatically the first time you open the Timetable page for a given date.

## 3. Set up Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → run it.
3. Go to **Authentication → Providers** and make sure **Email** sign-in is enabled
   (default). Optionally turn off "Confirm email" while developing, for a faster loop.
4. Grab your keys from **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
   - `service_role` key (keep secret, backend only) → `SUPABASE_SERVICE_ROLE_KEY`

## 4. Run the backend locally

```bash
cd backend
uv init
uv sync
.venv\Scripts\Activate.ps1       # Windows: venv\Scripts\activate
uv pip install -r requirements.txt

cp .env.example .env    # fill in SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / FRONTEND_ORIGINS
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

## 5. Run the frontend locally

```bash
cd frontend
npm install
cp .env.example .env    # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_API_BASE_URL
npm run dev
```

Visit `http://localhost:5173`, sign up with an email/password, then:

1. **Set Tasks** → add items to the Daily Task / Food / Gym tabs (start time, end time,
   and whether it repeats daily, on specific days, or just once).
2. **Timetable** → pick a date to see all three schedules merged and sorted by time; tap
   **Done** / **Not done** on each item (tap again to clear it back to pending).
3. **Analytics** → switch between Daily / Weekly / Quarterly / Yearly to see completion
   rate, done vs. not-done counts, a per-category breakdown, and your current streak.

## 6. Deploy to Render

Each side of the app has its own `render.yaml`; the simplest path is two separate Render
services (or point Render at the repo twice, once per `rootDir`).

**Backend (Web Service, Python)**
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
  `FRONTEND_ORIGINS` (your deployed frontend URL, e.g.
  `https://timetable-frontend.onrender.com`)

**Frontend (Web Service, Node — static build served via `serve`)**
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npx serve -s dist -l $PORT`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` (your
  deployed backend URL, e.g. `https://timetable-api.onrender.com`)

After both are live, update `FRONTEND_ORIGINS` on the backend and `VITE_API_BASE_URL`
on the frontend to point at each other's real Render URLs, then redeploy.

## 7. Design

The interface uses a soft **mint green + lavender purple** palette (see the CSS
variables at the top of `frontend/src/index.css`), Fraunces for headings and Inter for
body text, with color-coded categories throughout (purple = task, green = food, coral =
gym) and a green/red pill toggle for done/not-done on the Timetable page.
