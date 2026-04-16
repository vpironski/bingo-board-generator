/**
 * Groups entries by their primary (first) category.
 * Fisher-Yates shuffles each group in place.
 * @param {import('../hooks/useEntries').Entry[]} entries
 * @returns {Map<string, import('../hooks/useEntries').Entry[]>}
 */
export function groupByCategory(entries) {
  const groups = new Map()
  for (const entry of entries) {
    const cat = entry.categories?.[0] ?? 'Uncategorized'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat).push(entry)
  }
  for (const arr of groups.values()) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }
  return groups
}
