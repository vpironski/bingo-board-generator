# /check — Pre-commit Checklist

Run this before every commit.

- [ ] No `console.log` statements (search: `grep -r "console.log" src/`)
- [ ] No direct `db` imports in components or views
- [ ] All new Dexie operations are awaited
- [ ] No hardcoded widths — Tailwind only
- [ ] Empty states handled in every view
- [ ] `npm run build` passes with no errors