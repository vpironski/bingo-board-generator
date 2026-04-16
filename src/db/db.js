import Dexie from 'dexie'

export const db = new Dexie('BingoGeneratorDB')

db.version(1).stores({
  entries: '++id, name, category, difficulty, createdAt',
  boards:  '++id, size, mode, createdAt',
  cells:   '++id, boardId, row, col, entryId, marked'
})
