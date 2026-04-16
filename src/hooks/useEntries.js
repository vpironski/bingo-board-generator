import { useState, useEffect } from 'react'
import { liveQuery } from 'dexie'
import { db } from '../db/db'

/**
 * @typedef {{ id: number, name: string, categories: string[], difficulty: number, createdAt: string }} Entry
 */

export function useEntries() {
  const [entries, setEntries] = useState(undefined)

  useEffect(() => {
    const sub = liveQuery(() =>
      db.entries.orderBy('createdAt').reverse().toArray()
    ).subscribe({
      next: setEntries,
      error: err => console.error('useEntries:', err)
    })
    return () => sub.unsubscribe()
  }, [])

  /** @param {{ name: string, categories: string[], difficulty: number }} data */
  async function addEntry({ name, categories, difficulty }) {
    await db.entries.add({
      name: name.trim(),
      categories: categories.map(c => c.trim()).filter(Boolean),
      difficulty,
      createdAt: new Date().toISOString()
    })
  }

  /** @param {number} id @param {{ name: string, categories: string[], difficulty: number }} data */
  async function updateEntry(id, { name, categories, difficulty }) {
    await db.entries.update(id, {
      name: name.trim(),
      categories: categories.map(c => c.trim()).filter(Boolean),
      difficulty
    })
  }

  /**
   * Warns if entry is used in any saved board before deleting.
   * @param {number} id
   * @returns {Promise<boolean>} true if deleted, false if cancelled
   */
  async function deleteEntry(id) {
    const usedCount = await db.cells.where('entryId').equals(id).count()
    if (usedCount > 0) {
      const confirmed = window.confirm(
        `This entry appears in ${usedCount} saved board cell(s). Delete it anyway?`
      )
      if (!confirmed) return false
    }
    await db.entries.delete(id)
    return true
  }

  function exportCSV() {
    if (!entries?.length) return
    const rows = [
      'Name,Categories,Difficulty',
      ...entries.map(e => {
        const cats = (e.categories ?? []).join('|').replace(/"/g, '""')
        return `"${e.name.replace(/"/g, '""')}","${cats}",${e.difficulty}`
      })
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bingo-entries.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Bulk-inserts entries in a single IndexedDB transaction.
   * @param {Array<{name: string, categories: string[], difficulty: number}>} newEntries
   */
  async function bulkAddEntries(newEntries) {
    const now = new Date().toISOString()
    const records = newEntries.map(e => ({
      name: e.name.trim(),
      categories: (e.categories ?? []).map(c => c.trim()).filter(Boolean),
      difficulty: e.difficulty,
      createdAt: now,
    }))
    await db.entries.bulkAdd(records)
  }

  return { entries, addEntry, updateEntry, deleteEntry, exportCSV, bulkAddEntries }
}
