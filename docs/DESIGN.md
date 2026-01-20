# BirdWalk Design Specification

## Overview

Mobile-first web app for birders to track bird sightings during walks. Key differentiator: walk-centric organization with powerful search/sort/filter capabilities.

## Design Direction

- **Style:** Modern & polished - rounded corners, subtle shadows, smooth animations
- **Navigation:** Bottom tab bar with 3 tabs: Walks (square) | + (new walk) | Profile (circle)
- **Mobile-first:** Design for 375px width, scale up for larger screens

---

## Screen Wireframes

### 1. Walk List ("Bird Walks")

Main screen showing all user's walks.

```
┌─────────────────────────────┐
│ Bird Walks          [⊽] [↕] │  ← Header with filter/sort icons
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Coyote Point    8 Birds │ │  ← Walk card: name + count
│ │ Monday Jan 29 @ 4:35pm  │ │  ← Date + time
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Shoreline Park  3 Birds │ │
│ │ Sunday Jan 28 @ 7:15am  │ │
│ └─────────────────────────┘ │
│                             │
│      ┌──────────────┐       │
│      │    Search    │       │  ← Search button (navigates to /search)
│      └──────────────┘       │
├─────────────────────────────┤
│   □        +        ○       │  ← Bottom nav
└─────────────────────────────┘
```

**Components:**
- Header with title + filter/sort icons
- Scrollable list of WalkCard components
- Fixed Search button above bottom nav
- Bottom navigation

---

### 2. Walk Detail

View a single walk with all its sightings.

```
┌─────────────────────────────┐
│ ← Coyote Point      8 Birds │  ← Back arrow + name + count
│   Monday Jan 29 @ 4:35pm    │  ← Date + time
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │  (🐦)  Pacific Wren     │ │  ← Sighting card: icon + species
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │  (🐦)  Anna's Hummingbird│ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │  (🐦)  Dark-eyed Junco  │ │
│ └─────────────────────────┘ │
│                             │
│    ┌─────────────────┐      │
│    │ Record Sighting │      │  ← Primary action button
│    └─────────────────┘      │
├─────────────────────────────┤
│   □        +        ○       │
└─────────────────────────────┘
```

**Interactions:**
- Back arrow returns to walk list
- Tap sighting card opens SightingModal
- "Record Sighting" opens sighting form

---

### 3. Start a Bird Walk (New Walk)

Form to create a new walk. Accessed via + button in bottom nav.

```
┌─────────────────────────────┐
│      Start a Bird Walk      │  ← Centered title
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Name                    │ │  ← Text input for walk name
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ Notes (optional)        │ │  ← Textarea for notes
│ │                         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│      ┌──────────────┐       │
│      │    Start     │       │  ← Creates walk, redirects to detail
│      └──────────────┘       │
├─────────────────────────────┤
│   □        +        ○       │
└─────────────────────────────┘
```

**Auto-captured on Start:**
- GPS coordinates (location_lat, location_lng)
- Current date
- Current time (start_time)

---

### 4. Sighting Detail (Modal)

Modal overlay showing sighting details. Opens when tapping a sighting card.

```
┌─────────────────────────────┐
│                          ✕  │  ← Close button (top right)
│                             │
│        (🐦)                 │  ← Bird icon (centered)
│     Pacific Wren            │  ← Species name (centered)
│                             │
│   Time: 4:42pm              │
│   Type: Seen                │  ← Sighting metadata
│   Notes: "Near the creek,   │
│          singing loudly"    │
│                             │
│   ┌────────┐  ┌────────┐    │
│   │  Edit  │  │ Delete │    │  ← Action buttons
│   └────────┘  └────────┘    │
├─────────────────────────────┤
│   □        +        ○       │  ← Bottom nav visible behind
└─────────────────────────────┘
```

**Interactions:**
- ✕ closes modal
- Edit opens sighting form in edit mode
- Delete shows confirmation, then removes sighting

---

### 5. Record Sighting

Form to add a new sighting to a walk.

```
┌─────────────────────────────┐
│ ← Record Sighting           │  ← Back arrow + title
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🔍 Search species...    │ │  ← Autocomplete input
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Pacific Wren            │ │  ← Autocomplete dropdown
│ │ Pacific-slope Flycatcher│ │
│ │ Pacific Loon            │ │
│ └─────────────────────────┘ │
│                             │
│   Type:  [Seen] / Heard     │  ← Pill toggle, Seen is default
│                             │
│ ┌─────────────────────────┐ │
│ │ Notes (optional)        │ │  ← Textarea
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│      ┌──────────────┐       │
│      │     Save     │       │  ← Saves + returns to walk detail
│      └──────────────┘       │
├─────────────────────────────┤
│   □        +        ○       │
└─────────────────────────────┘
```

**Auto-captured on Save:**
- GPS coordinates
- Timestamp

**Species Autocomplete:**
- Queries eBird API as user types
- Shows common name
- Stores species_code and species_name

---

### 6. Login Page

```
┌─────────────────────────────┐
│                             │
│                             │
│        🐦 BirdWalk          │  ← App logo/title
│                             │
│ ┌─────────────────────────┐ │
│ │ Email                   │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Password                │ │
│ └─────────────────────────┘ │
│                             │
│      ┌──────────────┐       │
│      │    Log in    │       │
│      └──────────────┘       │
│                             │
│    Don't have an account?   │
│         Sign up →           │  ← Link to /signup
│                             │
└─────────────────────────────┘
```

**Note:** No bottom nav on auth pages.

---

### 7. Sign Up Page

```
┌─────────────────────────────┐
│                             │
│        🐦 BirdWalk          │
│                             │
│ ┌─────────────────────────┐ │
│ │ Email                   │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Password                │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Confirm Password        │ │
│ └─────────────────────────┘ │
│                             │
│      ┌──────────────┐       │
│      │   Sign up    │       │
│      └──────────────┘       │
│                             │
│    Already have account?    │
│          Log in →           │  ← Link to /login
└─────────────────────────────┘
```

---

### 8. Search Page

```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │ 🔍 Search walks & birds │ │  ← Search input
│ └─────────────────────────┘ │
├─────────────────────────────┤
│   Results for "Pacific"     │  ← Results header
│                             │
│ ┌─────────────────────────┐ │
│ │ Pacific Wren            │ │  ← Species name
│ │ Seen in: Coyote Point,  │ │  ← Walks where spotted
│ │ Shoreline Park          │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Pacific Loon            │ │
│ │ Seen in: Coyote Point   │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│   □        +        ○       │
└─────────────────────────────┘
```

**Interactions:**
- Autocomplete suggestions as user types
- Results grouped by species
- Tap walk name to navigate to that walk

---

### 9. Profile Page

```
┌─────────────────────────────┐
│          Profile            │  ← Centered title
├─────────────────────────────┤
│                             │
│      user@email.com         │  ← User's email
│                             │
│  ┌───────────────────────┐  │
│  │ 12 Walks              │  │  ← Stats card
│  │ 47 Species spotted    │  │
│  └───────────────────────┘  │
│                             │
│                             │
│      ┌──────────────┐       │
│      │   Log out    │       │  ← Logout button
│      └──────────────┘       │
│                             │
├─────────────────────────────┤
│   □        +        ○       │
└─────────────────────────────┘
```

---

## Component Inventory

### UI Components (`src/components/ui/`)
- **Button** - Primary and secondary variants
- **Input** - Text input with label
- **Textarea** - Multi-line input
- **Card** - Rounded container with shadow
- **Modal** - Overlay with backdrop

### Feature Components (`src/components/`)
- **BottomNav** - 3-tab navigation (Walks / + / Profile)
- **WalkCard** - Walk summary (name, count, date/time)
- **SightingCard** - Sighting summary (icon, species name)
- **SightingModal** - Sighting detail overlay
- **SightingForm** - Add/edit sighting form
- **SpeciesAutocomplete** - eBird species search

---

## Data Model

### walks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| name | text | User-entered walk name |
| location_lat | decimal | Auto-captured GPS |
| location_lng | decimal | Auto-captured GPS |
| date | date | Auto-captured |
| start_time | time | Auto-captured |
| notes | text | Optional |
| created_at | timestamptz | Auto |

### sightings
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| walk_id | uuid | FK to walks |
| species_code | text | eBird species code |
| species_name | text | Common name |
| location_lat | decimal | Auto-captured GPS |
| location_lng | decimal | Auto-captured GPS |
| timestamp | timestamptz | Auto-captured |
| type | text | 'seen' or 'heard' |
| notes | text | Optional |
| created_at | timestamptz | Auto |

---

## Design Tokens (Tailwind)

```
Colors:
- Primary: slate-900 (text), white (bg)
- Secondary: slate-600 (muted text)
- Accent: blue-600 (buttons, links)
- Border: slate-200
- Card bg: white with shadow-sm

Spacing:
- Card padding: p-4
- Section gap: space-y-4
- Screen padding: px-4

Borders:
- Radius: rounded-xl (cards), rounded-full (buttons)
- Border: border border-slate-200

Typography:
- Headings: font-semibold
- Body: font-normal
- Muted: text-slate-600
```
