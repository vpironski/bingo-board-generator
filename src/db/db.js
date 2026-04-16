import Dexie from 'dexie'

export const db = new Dexie('BingoGeneratorDB')

db.version(1).stores({
  entries: '++id, name, category, difficulty, createdAt',
  boards:  '++id, size, mode, createdAt',
  cells:   '++id, boardId, row, col, entryId, marked'
})

db.version(2).stores({
  entries: '++id, name, category, difficulty, createdAt',
  boards:  '++id, size, mode, difficulty, createdAt',
  cells:   '++id, boardId, row, col, entryId, marked'
}).upgrade(tx => {
  // Clamp any legacy difficulty 5 entries to 4 (Insane)
  return tx.table('entries').toCollection().modify(entry => {
    if (entry.difficulty > 4) entry.difficulty = 4
  })
})

db.version(3).stores({
  entries: '++id, name, *categories, difficulty, createdAt',
  boards:  '++id, size, mode, difficulty, createdAt',
  cells:   '++id, boardId, row, col, entryId, marked'
}).upgrade(tx => {
  // Migrate single category string → categories array
  return tx.table('entries').toCollection().modify(entry => {
    if (entry.category !== undefined) {
      entry.categories = [entry.category]
      delete entry.category
    }
    if (!entry.categories) {
      entry.categories = []
    }
  })
})

db.version(4).stores({
  entries: '++id, name, *categories, difficulty, createdAt',
  boards:  '++id, size, mode, difficulty, spread, freeCenter, createdAt',
  cells:   '++id, boardId, row, col, entryId, marked'
})
// No upgrade needed: spread/freeCenter are new fields on boards.
// No boards exist in older versions (boards were never persisted before v4),
// so no data migration is required.
