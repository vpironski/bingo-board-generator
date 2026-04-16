/**
 * Mutates grid in-place to ensure no row or column is entirely one difficulty.
 * Skips cells where difficulty === null (FREE space).
 * @param {object[]} grid — flat row-major array, length = size * size
 * @param {number} size
 * @returns {object[]} the same grid, mutated
 */
export function balanceGrid(grid, size) {
  function swap(i1, i2) {
    ;[grid[i1], grid[i2]] = [grid[i2], grid[i1]]
    grid[i1].row = Math.floor(i1 / size)
    grid[i1].col = i1 % size
    grid[i2].row = Math.floor(i2 / size)
    grid[i2].col = i2 % size
  }

  for (let r = 0; r < size; r++) {
    const idxs = []
    for (let c = 0; c < size; c++) {
      const cell = grid[r * size + c]
      if (cell?.difficulty != null) idxs.push(r * size + c)
    }
    if (idxs.length < 2) continue
    const diffs = new Set(idxs.map(i => grid[i].difficulty))
    if (diffs.size > 1) continue
    const [badDiff] = diffs
    rowSearch: for (let r2 = 0; r2 < size; r2++) {
      if (r2 === r) continue
      for (let c2 = 0; c2 < size; c2++) {
        const i2 = r2 * size + c2
        if (grid[i2]?.difficulty != null && grid[i2].difficulty !== badDiff) {
          swap(idxs[0], i2)
          break rowSearch
        }
      }
    }
  }

  for (let c = 0; c < size; c++) {
    const idxs = []
    for (let r = 0; r < size; r++) {
      const cell = grid[r * size + c]
      if (cell?.difficulty != null) idxs.push(r * size + c)
    }
    if (idxs.length < 2) continue
    const diffs = new Set(idxs.map(i => grid[i].difficulty))
    if (diffs.size > 1) continue
    const [badDiff] = diffs
    colSearch: for (let c2 = 0; c2 < size; c2++) {
      if (c2 === c) continue
      for (let r2 = 0; r2 < size; r2++) {
        const i2 = r2 * size + c2
        if (grid[i2]?.difficulty != null && grid[i2].difficulty !== badDiff) {
          swap(idxs[0], i2)
          break colSearch
        }
      }
    }
  }

  return grid
}
