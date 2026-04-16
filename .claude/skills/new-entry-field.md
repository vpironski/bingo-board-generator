# Skill: Add a Field to the Entry Model

## Steps
1. Increment db.version() in src/db/db.js — never edit existing version blocks
2. Add the field to the new version's schema string
3. Add a migration function if existing rows need a default value
4. Update the Entry JSDoc typedef in src/hooks/useEntries.js
5. Update EntryForm.jsx to include the new input
6. Update BulkImport/csvParser.js if the field should be importable
7. Update boardBuilder.js if the field affects placement logic

## Example version migration
\```js
db.version(2).stores({
entries: '++id, name, category, difficulty, tags, createdAt',
}).upgrade(tx => {
return tx.entries.toCollection().modify(entry => {
entry.tags = [];
});
});
\```