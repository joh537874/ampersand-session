# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version

This project uses **Next.js 16** (Turbopack). APIs and conventions may differ from older versions. Check `node_modules/next/dist/docs/` before making assumptions.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build (validates TypeScript + routes)
npm run lint     # ESLint
npm run start    # Start production server (requires build first)
```

TypeScript type-check: `npx tsc --noEmit`

## Architecture

**Ampersand 학회 세션 신청 사이트** — 회원들이 세션을 신청/취소하고, 신청 내역이 Notion에 자동 기록되는 Next.js 앱.

### Data flow

- **Session data** is hardcoded in `src/data/sessions.ts`. Adding/changing sessions requires editing this file and redeploying. No admin UI exists.
- **Registrations** are stored in Supabase (`registrations` table). Schema is in `supabase-setup.sql`.
- **Real-time updates** use Supabase Realtime (`postgres_changes` on the `registrations` table), subscribed in `SessionList.tsx` via `useEffect`.
- **Notion logging** happens fire-and-forget in API routes — failures never block the user action.

### Key architectural decisions

- **No auth system**: identity is `name` (plaintext) + `password` (bcrypt-hashed, stored in DB). The registration `id` + `name` pair is used to authorise cancellations.
- **My registrations are client-local**: `SessionList.tsx` stores the current user's registrations in React state (not persisted). If the user refreshes, they lose the "신청 완료" indicator but the DB record remains.
- **Two Supabase clients**: `supabase` (singleton, anon key, used for Realtime in browser) and `createServerSupabaseClient()` (service role, called per-request in API routes). The singleton uses `||` fallbacks so the build succeeds without env vars set.
- **`force-dynamic`** is set on `/` and `/attendees` so they always SSR and fetch fresh counts.

### Environment variables

| Variable | Used in |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client (Realtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes only |
| `NOTION_API_KEY` | API routes only |
| `NOTION_DATABASE_ID` | API routes only |

All variables go in `.env.local` (gitignored). Set the same variables in Vercel dashboard for production.

### Supabase setup

Run `supabase-setup.sql` in the Supabase SQL Editor to create the `registrations` table and enable Realtime. The unique index on `(session_id, name)` enforces the no-duplicate-registration rule — Postgres error code `23505` is caught in the POST handler.

### Notion database schema

Properties must be named exactly: `이름` (title), `세션명` (rich_text), `구분` (select: "신청"/"취소"), `처리시각` (date).

### Path alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Updating session data from Google Calendar

`fetch_calendar.py` reads the "Ampersand 1기 일정" Google Calendar and regenerates `src/data/sessions.ts`. Run it locally, commit the updated file, and redeploy.

```bash
python3 fetch_calendar.py
```

Requires `credentials.json` and `token.json` (both gitignored).
