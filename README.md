# Bingo Board Generator

A personal PWA that runs as a standalone app on iPhone. Install it once via Safari and it works fully offline — no App Store, no account, no server.

You build up a pool of entries (each with a name, one or more categories, and a difficulty), then generate bingo boards of variable size with configurable placement rules. Boards are interactive (tap squares to mark them) and exportable as images.

**All data is stored locally on the device.** Nothing is ever sent anywhere.

---

## Features

- Add entries one by one or bulk-import via CSV
- Each entry has a name, one or more categories, and a difficulty (Easy / Medium / Hard / Insane)
- Generate boards: 3×3, 5×5, 7×7, or 9×9
- Two board modes: **Category** (spreads entries by category variety) or **Category + Difficulty** (weighted difficulty sampling)
- Four spread patterns (A–D) for difficulty-mode boards
- Optional free center cell
- Filter which categories are included in a board
- Tap cells to mark them — state persists immediately
- Export board as PNG — downloads on desktop, share sheet on iPhone (save to Photos)
- Delete boards individually; delete entries with a warning if they appear in saved boards
- Export full entry list as CSV backup

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Database | IndexedDB via Dexie.js v4 |
| Routing | React Router v7 |
| PWA | vite-plugin-pwa |
| Hosting | GitHub Pages |

No backend. No server. No accounts.

---

## Project Structure

```
src/
├── components/
│   ├── BoardControls.jsx    # Size, mode, difficulty, spread, free center controls
│   ├── BoardGrid.jsx        # N×N grid — renders cells, handles tap-to-mark
│   ├── BulkImport.jsx       # CSV upload for bulk entry input
│   ├── CategoryPicker.jsx   # Category filter chips for board generation
│   ├── EntryForm.jsx        # Single entry input (name, categories, difficulty)
│   ├── EntryList.jsx        # Displays saved entries with edit/delete
│   ├── ExportButton.jsx     # PNG export button
│   └── SpreadPicker.jsx     # A/B/C/D spread pattern selector
├── views/
│   ├── Home.jsx             # Entry management: list, add, bulk import
│   ├── Generate.jsx         # Board configuration + generation
│   ├── Board.jsx            # Interactive board: tap to mark, export
│   └── SavedBoards.jsx      # List of saved boards
├── hooks/
│   ├── useEntries.js        # CRUD for entries (Dexie)
│   └── useBoard.js          # Board generation, load, toggle, delete, live queries
├── logic/
│   ├── boardBuilder.js      # Core placement algorithm + spread patterns
│   ├── categoryGrouper.js   # Groups and shuffles entries by category
│   └── difficultyBalancer.js # Ensures rows/cols aren't difficulty-homogeneous (spread D)
├── utils/
│   ├── csvParser.js         # Parses bulk CSV into entry objects
│   └── exportImage.js       # Synchronous canvas renderer → PNG share/download
└── db/
    └── db.js                # Dexie schema (version 4) + migration history
```

---

## Database

Uses **IndexedDB** (via Dexie.js) — a real on-device database built into every browser. Data lives in Safari's private storage on the device. It never leaves the phone.

### Schema (version 4)

```
entries  — id, name, categories[], difficulty, createdAt
boards   — id, size, mode, difficulty, spread, freeCenter, createdAt
cells    — id, boardId, row, col, entryId, name, categories[], difficulty, marked
```

`cells` denormalizes `name`, `categories`, and `difficulty` from `entries` for fast rendering without joins. A 5×5 board = 25 rows in the `cells` table.

Board generation and deletion are wrapped in transactions — atomic, never partial.

The UI uses **liveQuery** (Dexie's reactive subscription) — when you tap a cell and `marked` updates in the DB, React re-renders automatically without manual state management.

### Migration history

| Version | Change |
|---|---|
| v1 | Initial schema — `category` as a single string |
| v2 | Added `difficulty` to boards; clamped any legacy difficulty > 4 |
| v3 | Migrated `category: string` → `categories: string[]` on all entries |
| v4 | Added `spread` and `freeCenter` fields to boards |

---

## Board Generation Algorithm

### Category mode

1. Group entries by primary category, shuffle each group (Fisher-Yates)
2. Round-robin interleave across category groups to avoid clustering
3. Random scatter across the grid

### Category + Difficulty mode

1. Compute target count per difficulty tier from the board's difficulty setting using the weights table below
2. Sample entries from each tier; if a tier is empty, redistribute to the nearest neighbour
3. Round-robin interleave by category
4. Apply the chosen spread pattern

**Difficulty weights table**

| Board difficulty | Easy | Medium | Hard | Insane |
|---|---|---|---|---|
| Easy | 70% | 30% | — | — |
| Medium | 20% | 55% | 25% | — |
| Hard | — | 20% | 50% | 30% |
| Insane | — | 5% | 30% | 65% |

**Spread patterns**

| Spread | Behaviour |
|---|---|
| A | Diagonal gradient — easy entries top-left, hard bottom-right |
| B | Random scatter |
| C | Row progression — easy rows first, hard rows last |
| D | Random scatter + balancer ensures no row or column is entirely one difficulty |

---

## Bulk CSV Import

Upload a CSV with this format:

```csv
Name,Categories,Difficulty
Eiffel Tower,Europe|Landmarks,Medium
Local Coffee Shop,Streets,Easy
```

- **Categories** — pipe-separated for multiple: `Cat1|Cat2`
- **Difficulty** — `Easy`, `Medium`, `Hard`, `Insane` (or `1`–`4`)
- Legacy single `Category` column is accepted for backwards compatibility
- Malformed rows are skipped with a report shown after import

Download the template from the Bulk Import screen in the app.

---

## Export

Tapping **Export** on a board:

- **Desktop** — downloads a PNG of the board
- **iPhone** — opens the native share sheet; tap **Save Image** to save to Photos

The export renders via synchronous Canvas API to preserve the iOS user-gesture context required for `navigator.share()`.

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# For iPhone testing on the same Wi-Fi network:
# open http://<your-machine-local-ip>:5173 in Safari on iPhone

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment

The app deploys automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

To set it up on a fork:

1. Go to **Settings → Pages** in your GitHub repo
2. Set source to **GitHub Actions**
3. Push to `main` — the workflow builds and deploys automatically

The live URL will be: `https://<your-username>.github.io/bingo-board-generator/`

---

## Installing on iPhone

1. Open the GitHub Pages URL in **Safari** (Chrome on iOS cannot install PWAs)
2. Tap the **Share** button (box with arrow at the bottom of the screen)
3. Tap **Add to Home Screen**
4. Tap **Add**

The app launches fullscreen from the home screen and works fully offline after the first load.

> **Note:** Safari can evict IndexedDB storage if the device is critically low on space. Use the **Export CSV** button on the Home tab periodically to back up your entries.

---

## Data Safety

Entries are the primary asset — your curated dataset, not regeneratable. Boards are derived and can always be regenerated.

- **Export entries** → CSV download from the Home tab — save to Files or iCloud Drive
- **Import entries** → re-upload the same CSV to restore
- **Boards** are not exportable as data — use the image export before deleting if you want a record
