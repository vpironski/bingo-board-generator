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
