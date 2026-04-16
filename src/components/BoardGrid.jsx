// Tailwind grid-col classes must be string literals for purge detection
const GRID_COLS = {
  3: 'grid-cols-3',
  5: 'grid-cols-5',
  7: 'grid-cols-7',
  9: 'grid-cols-9',
}

const TEXT_SIZE = {
  3: 'text-sm',
  5: 'text-xs',
  7: 'text-[10px]',
  9: 'text-[8px]',
}

const DIFF_DOT = {
  1: 'bg-green-400',
  2: 'bg-yellow-400',
  3: 'bg-orange-400',
  4: 'bg-red-500',
}

/**
 * @param {{
 *   cells: object[],
 *   size: number,
 *   onToggle: (cellId: number, currentMarked: boolean) => void
 * }} props
 */
export default function BoardGrid({ cells, size, onToggle }) {
  const colClass = GRID_COLS[size] ?? 'grid-cols-5'
  const textClass = TEXT_SIZE[size] ?? 'text-xs'

  return (
    <div className={`grid ${colClass} gap-0.5 w-full`}>
      {cells.map(cell => {
        const isFree = cell.entryId === null

        const bgClass = isFree
          ? 'bg-gray-100 border-gray-200'
          : cell.marked
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white border-gray-200 active:bg-gray-50'

        const textColor = cell.marked || isFree ? (isFree ? 'text-gray-400' : 'text-white') : 'text-gray-800'

        return (
          <button
            key={cell.id}
            type="button"
            onClick={() => !isFree && onToggle(cell.id, cell.marked)}
            disabled={isFree}
            className={`aspect-square overflow-hidden rounded-md border flex flex-col items-center justify-center p-1 relative ${bgClass}`}
          >
            <span className={`${textClass} ${textColor} font-medium text-center leading-tight line-clamp-3 break-words w-full`}>
              {cell.name}
            </span>
            {!isFree && !cell.marked && cell.difficulty && (
              <span className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${DIFF_DOT[cell.difficulty]}`} />
            )}
          </button>
        )
      })}
    </div>
  )
}
