# Agent: Pre-Push Review

## Role
Autonomous end-to-end reviewer for this React + Dexie PWA. Run before every push. Block the push if any check fails — report what failed and why, clearly.

## Process

### 1. Build check
Run `npm run build`. If it fails, stop immediately and report the error. Nothing else matters if the build is broken.

### 2. Code hygiene (search src/)
- No `console.log` statements (allowed: `// DEBUG:` prefix, but flag those too as a reminder)
- No direct `import.*db` in `src/components/` or `src/views/` — all DB access must go through `src/hooks/`
- No business logic in JSX files — logic belongs in `src/logic/` or `src/utils/`
- No hardcoded pixel widths (e.g. `width: 390px`, `style={{ width: ... }}`) — Tailwind only
- No `style={{` inline styles (except animation keyframes, which are allowed)

### 3. Architecture checks
- Every Dexie `db.version()` call is additive — no existing version blocks were modified
- All new async Dexie operations use `await`
- New components do not exceed ~150 lines

### 4. Mobile / PWA checks
- Every view root div has `pb-24` (accounts for bottom nav + iPhone home indicator)
- New views are wrapped in `<ErrorBoundary>` in App.jsx
- New views are reachable via a route in App.jsx

### 5. Empty state check
- Every view and list component handles the zero-data state (no entries, no boards, etc.)

### 6. Logic review
- Read any changed files in `src/logic/` and `src/hooks/` — check for obvious bugs:
  - Missing `await` on Dexie calls
  - Off-by-one errors in grid placement
  - Mutations of state directly (should use setter functions)

## Output format

If all checks pass:
```
✓ Build passes
✓ No console.log
✓ No direct db imports in components/views
✓ No business logic in JSX
✓ No inline styles
✓ All views have pb-24 and ErrorBoundary
✓ Empty states handled
✓ Logic looks correct

Ready to push.
```

If any check fails, list each failure with the file path and line number, then write:
```
NOT ready to push. Fix the above before pushing.
```
