# BirdWalk

Mobile-first web app for birders to track bird sightings during walks.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Postgres + Auth)
- **Bird Data:** eBird API (Cornell Lab)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/, signup/     # Auth pages (no bottom nav)
│   ├── walks/              # Walk list, detail, new walk
│   ├── search/             # Search page
│   └── profile/            # Profile page
├── components/
│   ├── ui/                 # Reusable UI (Button, Input, Card, Modal)
│   └── [Feature]*.tsx      # Feature components
├── lib/
│   ├── supabase/           # Supabase client (client.ts, server.ts)
│   └── ebird.ts            # eBird API helpers
└── types/                  # TypeScript types
```

## Data Model

**walks:** id, user_id, name, location_lat, location_lng, date, start_time, notes, created_at

**sightings:** id, walk_id, species_code, species_name, location_lat, location_lng, timestamp, type (seen/heard), notes, created_at

## Design Conventions

- **Mobile-first:** Design for 375px width, scale up
- **Style:** Rounded corners (lg), subtle shadows, smooth transitions
- **Navigation:** Bottom tab bar with 3 tabs: Walks | + | Profile
- **Cards:** Generous padding, full-width on mobile
- **Buttons:** Full-width primary actions near bottom of screen
- **Auth pages:** No bottom nav

## Key Behaviors

- Walks have no "end" state - users can add sightings anytime
- GPS + timestamp auto-captured when starting a walk
- GPS + timestamp auto-captured when recording a sighting
- Sighting type: "seen" (default) or "heard" toggle
- Species selection via eBird API autocomplete

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EBIRD_API_KEY=
```
