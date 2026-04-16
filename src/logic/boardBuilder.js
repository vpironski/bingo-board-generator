import { groupByCategory } from './categoryGrouper.js'
import { balanceGrid } from './difficultyBalancer.js'

/**
 * Difficulty spread weights by board difficulty setting.
 * Keys are board difficulty (1–4). Values map entry difficulty → target fraction.
 * Rows sum to 1.0.
 */
export const DIFFICULTY_SPREAD = {
  1: { 1: 0.70, 2: 0.30, 3: 0.00, 4: 0.00 }, // Easy board
  2: { 1: 0.20, 2: 0.55, 3: 0.25, 4: 0.00 }, // Medium board
  3: { 1: 0.00, 2: 0.20, 3: 0.50, 4: 0.30 }, // Hard board
  4: { 1: 0.00, 2: 0.05, 3: 0.30, 4: 0.65 }, // Insane board
}

export const DIFFICULTY_LABELS = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
  4: 'Insane',
}

function fisherYates(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function cycleToFill(pool, count) {
  const result = []
  for (let i = 0; i < count; i++) result.push(pool[i % pool.length])
  return result
}

function interleaveRoundRobin(groups, count) {
  const arrays = [...groups.values()].filter(a => a.length > 0)
  if (!arrays.length) return []
  const cursors = new Array(arrays.length).fill(0)
  const result = []
  let i = 0
  while (result.length < count) {
    const ai = i % arrays.length
    result.push(arrays[ai][cursors[ai] % arrays[ai].length])
    cursors[ai]++
    i++
  }
  return result
}

function makeFreeCell(row, col) {
  return { row, col, entryId: null, name: 'FREE', categories: [], difficulty: null, marked: true }
}

function toCell(entry, row, col) {
  return {
    row, col,
    entryId: entry.id,
    name: entry.name,
    categories: entry.categories ?? [],
    difficulty: entry.difficulty,
    marked: false,
  }
}

function buildPool(entries, realCells, mode, difficulty) {
  if (mode === 'category') {
    return interleaveRoundRobin(groupByCategory(entries), realCells)
  }

  const weights = DIFFICULTY_SPREAD[difficulty]
  const targets = {}
  let total = 0
  for (let d = 1; d <= 4; d++) {
    targets[d] = Math.round(weights[d] * realCells)
    total += targets[d]
  }
  // Fix rounding drift on dominant bucket
  const delta = realCells - total
  if (delta !== 0) {
    const dom = parseInt(Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0])
    targets[dom] += delta
  }

  const byDiff = {}
  for (let d = 1; d <= 4; d++) {
    byDiff[d] = fisherYates(entries.filter(e => e.difficulty === d))
  }

  // Redistribute targets for empty buckets to nearest non-empty neighbor
  for (let d = 1; d <= 4; d++) {
    if (targets[d] > 0 && byDiff[d].length === 0) {
      const surplus = targets[d]
      targets[d] = 0
      const nbrs = [d - 1, d + 1].filter(n => n >= 1 && n <= 4 && byDiff[n].length > 0)
      const dest = nbrs.length > 0 ? nbrs[0] : [1, 2, 3, 4].find(n => byDiff[n].length > 0)
      if (dest != null) targets[dest] += surplus
    }
  }

  const sampled = [1, 2, 3, 4].flatMap(d => targets[d] > 0 ? cycleToFill(byDiff[d], targets[d]) : [])
  return interleaveRoundRobin(groupByCategory(sampled), realCells)
}

/**
 * Builds a bingo board from entries and generation options.
 * Returns cells array — no `id` or `boardId` (assigned by Dexie on bulkAdd).
 *
 * @param {import('../hooks/useEntries').Entry[]} entries
 * @param {{ size: number, mode: 'category'|'category+difficulty', difficulty: number, spread: 'A'|'B'|'C'|'D', freeCenter: boolean }} options
 * @returns {object[]}
 */
export function buildBoard(entries, { size, mode, difficulty, spread, freeCenter }) {
  const totalCells = size * size
  const centerIdx = Math.floor(totalCells / 2)
  const realCells = freeCenter ? totalCells - 1 : totalCells

  const pool = buildPool(entries, realCells, mode, difficulty)

  // Positions in row-major order, free center removed if needed
  const positions = Array.from({ length: totalCells }, (_, i) => ({
    row: Math.floor(i / size),
    col: i % size,
  })).filter((_, i) => !(freeCenter && i === centerIdx))

  let cells

  if (mode === 'category' || spread === 'B') {
    // Random scatter
    fisherYates(positions)
    cells = positions.map((pos, i) => toCell(pool[i], pos.row, pos.col))

  } else if (spread === 'A') {
    // Diagonal gradient: easy top-left → hard bottom-right
    const diagGroups = new Map()
    for (const pos of positions) {
      const key = pos.row + pos.col
      if (!diagGroups.has(key)) diagGroups.set(key, [])
      diagGroups.get(key).push(pos)
    }
    for (const g of diagGroups.values()) fisherYates(g)
    const sortedPositions = [...diagGroups.entries()]
      .sort((a, b) => a[0] - b[0])
      .flatMap(([, g]) => g)
    const sortedPool = [...pool].sort((a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0))
    cells = sortedPositions.map((pos, i) => toCell(sortedPool[i], pos.row, pos.col))

  } else if (spread === 'C') {
    // Row progression: easy rows first → hard rows last
    const sortedPool = [...pool].sort((a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0))
    let pi = 0
    cells = []
    for (let r = 0; r < size; r++) {
      const rowPositions = fisherYates(positions.filter(p => p.row === r))
      for (const pos of rowPositions) {
        cells.push(toCell(sortedPool[pi++], pos.row, pos.col))
      }
    }

  } else {
    // Spread D: random scatter then balance rows/cols
    fisherYates(positions)
    const grid = new Array(totalCells).fill(null)
    positions.forEach((pos, i) => {
      grid[pos.row * size + pos.col] = toCell(pool[i], pos.row, pos.col)
    })
    if (freeCenter) {
      grid[centerIdx] = makeFreeCell(Math.floor(size / 2), Math.floor(size / 2))
    }
    balanceGrid(grid, size)
    cells = grid.filter(c => c !== null && c.entryId !== null)
  }

  if (freeCenter) {
    cells.push(makeFreeCell(Math.floor(size / 2), Math.floor(size / 2)))
  }

  cells.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col)
  return cells
}
