# CLAUDE.md — Bingo Board Generator

## Project Overview

A personal PWA (Progressive Web App) that runs as a **standalone app on iPhone** — installed via Safari "Add to Home Screen," launches fullscreen with no browser UI, and works entirely offline. Not intended for public release.

Users can input entries one-by-one or in bulk, each with a **name**, **category**, and **difficulty**. The app generates bingo boards of variable size (3×3, 5×5, 7×7, 9×9, etc.) using a placement algorithm that arranges entries by category and/or difficulty. Boards are interactive (tap squares to mark them) and exportable as images to share.

All data is persisted locally on the device via **IndexedDB** — entries and boards survive every app restart and relaunch indefinitely.

**Entries are the primary asset of this app.** They are the user's curated data set, built up over time, and must never be lost. Boards are derived and regeneratable — they are secondary. Every architectural and UX decision should protect entries first.

---

## Architecture Decisions & Rationale

### Why PWA and not a native iOS app?
A fully free, no-expiry standalone iOS app is only achievable as a PWA. Native iOS options either require a $99/year Apple Developer account (TestFlight) or expire every 7 days (Xcode sideloading). Once installed via Safari on iPhone, a PWA is indistinguishable from a native app for this use case — it has its own icon, launches fullscreen, and works offline.

### Why IndexedDB (via Dexie.js) and not localStorage?
`localStorage` is synchronous, size-limited (~5MB), and stores everything as flat strings. It is not suitable for structured, relational data. `IndexedDB` is a real on-device database: async, queryable, capable of storing large datasets, and persistent across app restarts. `Dexie.js` is a thin wrapper that makes IndexedDB ergonomic. This is the correct persistence layer for a native-feeling app.

### Why React + Vite?
Fast development, component reusability, and if the decision is ever made to migrate to React Native, the entire logic layer (`src/logic/`, `src/hooks/`, `src/utils/`) is portable with zero changes.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast dev, PWA-ready, portable to React Native |
| Styling | Tailwind CSS | Mobile-first utility classes, no custom CSS overhead |
| Database | IndexedDB via `Dexie.js` | Persistent, structured, queryable, on-device |
| State | `useState` / `useReducer` + React Context | No external lib needed at this scale |
| Image Export | `html2canvas` | Renders board DOM node as PNG → iPhone share sheet |
| PWA | `vite-plugin-pwa` | Service worker, offline support, installable |
| Routing | React Router v6 | Simple multi-view navigation |
| Hosting | GitHub Pages | Free, permanent, zero config after setup |

No backend. No server. No accounts. Everything lives on the device.

---

## Project Structure

```
bingo-generator/
├── public/
│   ├── manifest.json            # PWA manifest (name, icons, display: standalone)
│   └── icons/                   # App icons for iPhone home screen (192px, 512px, apple-touch-icon)
├── src/
│   ├── components/
│   │   ├── BoardGrid.jsx        # Renders bingo board grid, handles tap-to-mark
│   │   ├── EntryForm.jsx        # Single entry input (name, category, difficulty)
│   │   ├── BulkImport.jsx       # CSV / plain text paste for bulk entry input
│   │   ├── BoardControls.jsx    # Size picker, mode selector, generate button
│   │   ├── EntryList.jsx        # Displays all saved entries with edit/delete
│   │   └── ExportButton.jsx     # Triggers html2canvas image export
│   ├── views/
│   │   ├── Home.jsx             # Entry management: list, add, bulk import
│   │   ├── Generate.jsx         # Board configuration + generation trigger
│   │   ├── Board.jsx            # Interactive board: tap to mark, export
│   │   └── SavedBoards.jsx      # List of previously generated boards
│   ├── logic/
│   │   ├── boardBuilder.js      # Core algorithm: places entries on grid
│   │   ├── difficultyBalancer.js # Ensures no row/col is difficulty-homogeneous
│   │   └── categoryGrouper.js   # Groups and sorts entries by category
│   ├── hooks/
│   │   ├── useEntries.js        # CRUD operations for entries via Dexie
│   │   └── useBoard.js          # Board state, marked squares, save/load, export
│   ├── db/
│   │   └── db.js                # Dexie database definition and schema
│   ├── utils/
│   │   ├── csvParser.js         # Parses bulk CSV / plain text input into Entry objects
│   │   └── exportImage.js       # html2canvas wrapper → PNG download / share
│   ├── App.jsx
│   └── main.jsx
├── CLAUDE.md                    # This file
├── vite.config.js               # Includes vite-plugin-pwa config
├── tailwind.config.js
└── package.json
```

---

## Database Schema (`src/db/db.js`)

Uses **Dexie.js** wrapping IndexedDB. Three tables:

```js
import Dexie from 'dexie';

export const db = new Dexie('BingoGeneratorDB');

db.version(1).stores({
  entries: '++id, name, category, difficulty, createdAt',
  boards:  '++id, size, mode, createdAt',
  cells:   '++id, boardId, row, col, entryId, marked'
});
```

- `entries` — the master pool of user-defined bingo items
- `boards` — metadata for each generated board
- `cells` — each individual cell on a board, linked to `boardId`; `marked` is updated in place when user taps

**Never store `cells` as a JSON blob inside `boards`.** Keep them normalized so marked state can be updated with a single `db.cells.update()` call.

---

## Data Model

### Entry

```js
{
  id: number,          // auto-incremented by Dexie
  name: string,        // e.g. "Eiffel Tower"
  category: string,    // e.g. "Sofia", "Trip", "Food"
  difficulty: 1 | 2 | 3 | 4, // 1=Easy, 2=Medium, 3=Hard, 4=Insane
  createdAt: string           // ISO timestamp
}
```

### Board

```js
{
  id: number,          // auto-incremented
  size: number,        // e.g. 5 for a 5x5 board
  mode: "category" | "category+difficulty",
  difficulty: 1 | 2 | 3 | 4, // board difficulty setting — drives entry spread (see DIFFICULTY_SPREAD)
  createdAt: string
}
```

### Cell

```js
{
  id: number,          // auto-incremented
  boardId: number,     // FK -> boards.id
  row: number,         // 0-indexed
  col: number,         // 0-indexed
  entryId: number,     // FK -> entries.id (null for FREE space)
  name: string,        // denormalized for fast render without joins
  category: string,    // denormalized
  difficulty: number,  // denormalized
  marked: boolean      // toggled on tap; persisted immediately
}
```

Denormalizing `name`, `category`, `difficulty` into `cells` avoids join queries on every render. The source of truth for entry data is still `entries`.

---

## Core Algorithm (`src/logic/boardBuilder.js`)

### Mode 1: Category Only

1. Group entries by category.
2. Shuffle within each category group (Fisher-Yates).
3. Fill the grid left-to-right, top-to-bottom, round-robin across category groups so adjacent squares vary.
4. If pool < `size²`: cycle through pool repeatedly to fill. If pool > `size²`: take a proportional slice from each category.
5. Place FREE space at center cell for odd-sized boards.

### Mode 2: Category + Difficulty

1. Determine the target cell count per difficulty bucket using `DIFFICULTY_SPREAD[boardDifficulty]` (see table below).
2. Sample entries from each bucket proportionally. If a bucket is undersized, redistribute its deficit to the nearest neighbouring bucket(s).
3. Shuffle each bucket (Fisher-Yates).
4. Group sampled entries by category, then interleave round-robin across categories to avoid clustering.
5. Apply a **diagonal difficulty gradient**: easier entries placed towards top-left, harder entries towards bottom-right.
6. Run `difficultyBalancer.js` — swaps cells to ensure no single row or column is all-same-difficulty.
7. Place FREE space at center cell with `marked: true`.

### Difficulty Spread Table (`src/logic/boardBuilder.js → DIFFICULTY_SPREAD`)

The board difficulty selector controls which entry difficulties are pulled and in what proportion:

| Board difficulty | Easy (1) | Medium (2) | Hard (3) | Insane (4) |
|---|---|---|---|---|
| Easy | 70% | 30% | — | — |
| Medium | 20% | 55% | 25% | — |
| Hard | — | 20% | 50% | 30% |
| Insane | — | 5% | 30% | 65% |

**Rationale:** Every board has neighbouring-difficulty entries so no difficulty tier feels totally isolated. Easy boards are still accessible but have Medium variety. Insane boards are brutal but not monotone.

### Hard Constraints

- Grid must always be fully filled. No empty cells except the FREE space.
- Center cell of every odd-sized board is always FREE (`entryId: null, marked: true`).
- Best-effort: no two entries of the same category share the same row AND same column.
- Minimum viable pool: at least `Math.ceil(size² / 2)` unique entries recommended. Warn the user if the pool is too small.

---

## Key Behaviours

- **Tap a square** → toggles `marked` → cell turns red → immediately persisted via `db.cells.update(id, { marked })`.
- **Long-press a square** → bottom sheet shows entry detail: name, category, difficulty badge.
- **Export** → `html2canvas` captures the board `<div>` as PNG → triggers native iOS share sheet (save to Photos, share to iMessage, etc.).
- **Bulk import** → paste CSV or plain text, one entry per line: `Name, Category, Difficulty`. Parser strips whitespace, validates difficulty is 1–4 (Easy/Medium/Hard/Insane), skips malformed rows and reports them to the user.
- **Board size picker** → 3, 5, 7, 9 (odd only, enforced in UI).
- **Board difficulty picker** → Easy / Medium / Hard / Insane. Controls entry spread via `DIFFICULTY_SPREAD` — not just which entries are included but the proportion from each level (see Difficulty Spread Table above).
- **Saved entries** → the entry pool is always persisted. It is the core dataset of the app. Entries are never ephemeral.
- **Saved boards** → generated boards also persist, but are secondary. A board can always be regenerated from entries; entries cannot be regenerated from boards.
- **Delete entry** → warns if the entry is used in any saved board before deleting. Never silently delete.
- **Export entries** → users can export their full entry list as CSV for backup. This is a safety net against Safari clearing IndexedDB storage on low-storage devices.

---

## Commands

```bash
# Install dependencies
npm install

# Start dev server
# For iPhone testing: use your machine's local IP, e.g. http://192.168.1.x:5173
npm run dev

# Build for production (outputs to /dist)
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## Development Conventions

- **No TypeScript** — plain JS with JSDoc type annotations. Keep the stack lean.
- **No external state library** — `useReducer` + Context is sufficient. No Redux, no Zustand.
- **Mobile-first always** — design for 390px width (iPhone 14). Test in Chrome DevTools device mode before testing on device.
- **Tailwind only** — no custom CSS except animation keyframes if needed. No inline styles.
- **IDs** — Dexie auto-increments all IDs. Never manually assign IDs. Use `crypto.randomUUID()` only for non-DB temporary keys (e.g. unsaved form state).
- **All DB access via hooks** — components never import `db` directly. All Dexie calls live in `src/hooks/`. Components call hook functions only.
- **Logic stays out of components** — board generation, CSV parsing, and difficulty balancing live in `src/logic/` and `src/utils/`. JSX files contain no business logic.
- **Persist marked state immediately** — do not batch or debounce cell mark updates. Call `db.cells.update()` on every tap. The user must never lose a mark.
- **No `console.log` in commits** — use `// DEBUG:` prefix and strip before committing.
- **Component size limit** — split any component exceeding ~150 lines.
- **Error boundaries** — wrap each view in an error boundary so a crash in one view does not kill the whole app.

---

## PWA Configuration Notes

The `vite-plugin-pwa` config in `vite.config.js` must include:

```js
manifest: {
  display: 'standalone',        // fullscreen, no browser UI on launch
  orientation: 'portrait',
  background_color: '#ffffff',
  theme_color: '#000000',
  icons: [/* 192px, 512px, apple-touch-icon */]
}
```

`display: standalone` is what makes it feel like a real app when launched from the home screen. Without this, Safari shows the address bar.

Service worker strategy: **CacheFirst** for all static assets, **NetworkFirst** for nothing — this app is fully offline after install. There are no network calls in production.

---

## iPhone Installation (End User Flow)

1. Open the GitHub Pages URL in **Safari** (must be Safari — Chrome on iOS cannot install PWAs).
2. Tap the **Share** button (box with arrow).
3. Tap **Add to Home Screen**.
4. The app appears on the home screen with its icon and launches fullscreen.
5. All data is stored in IndexedDB on the device and persists across every launch.

---

## Out of Scope

- User accounts / authentication
- Backend, API, or cloud sync
- Multi-player or real-time features
- Push notifications
- Android (PWA works there too, but not a design target)
- App Store or TestFlight distribution
- Notion integration — evaluated and ruled out (adds sync complexity with no benefit over on-device storage)
- GitHub Actions as app runtime — not suitable for interactive stateful applications
