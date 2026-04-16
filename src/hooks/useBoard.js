import { useState, useEffect } from 'react'
import { liveQuery } from 'dexie'
import { db } from '../db/db'
import { buildBoard } from '../logic/boardBuilder'

export function useBoard() {
  const [savedBoards, setSavedBoards] = useState(undefined)

  useEffect(() => {
    const sub = liveQuery(() =>
      db.boards.orderBy('createdAt').reverse().toArray()
    ).subscribe({
      next: setSavedBoards,
      error: err => console.error('useBoard:', err),
    })
    return () => sub.unsubscribe()
  }, [])

  /**
   * Generates a board, persists it, and returns the new boardId.
   * @param {import('./useEntries').Entry[]} entries
   * @param {{ size: number, mode: string, difficulty: number, spread: string, freeCenter: boolean }} options
   * @returns {Promise<number>}
   */
  async function generateBoard(entries, options) {
    const cells = buildBoard(entries, options)
    let boardId
    await db.transaction('rw', db.boards, db.cells, async () => {
      boardId = await db.boards.add({
        size: options.size,
        mode: options.mode,
        difficulty: options.difficulty,
        spread: options.spread,
        freeCenter: options.freeCenter,
        createdAt: new Date().toISOString(),
      })
      await db.cells.bulkAdd(cells.map(c => ({ ...c, boardId })))
    })
    return boardId
  }

  /**
   * Loads a board and its cells, sorted by row then col.
   * @param {number} boardId
   * @returns {Promise<{ board: object, cells: object[] }>}
   */
  async function loadBoard(boardId) {
    const [board, rawCells] = await Promise.all([
      db.boards.get(boardId),
      db.cells.where('boardId').equals(boardId).toArray(),
    ])
    const cells = rawCells.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col)
    return { board, cells }
  }

  /**
   * Toggles the marked state of a single cell.
   * @param {number} cellId
   * @param {boolean} currentMarked
   */
  async function toggleCell(cellId, currentMarked) {
    await db.cells.update(cellId, { marked: !currentMarked })
  }

  /**
   * Deletes a board and all its cells.
   * @param {number} boardId
   */
  async function deleteBoard(boardId) {
    await db.transaction('rw', db.boards, db.cells, async () => {
      await db.cells.where('boardId').equals(boardId).delete()
      await db.boards.delete(boardId)
    })
  }

  return { generateBoard, loadBoard, toggleCell, deleteBoard, savedBoards }
}
