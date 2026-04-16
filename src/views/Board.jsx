import { useParams, useNavigate } from 'react-router-dom'
import { useBoardLive } from '../hooks/useBoard'
import BoardGrid from '../components/BoardGrid'

const DIFF_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Insane' }
const MODE_LABELS = { 'category': 'Category', 'category+difficulty': 'Cat + Difficulty' }

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

export default function Board() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const { board, cells, toggleCell } = useBoardLive(parseInt(boardId, 10))

  if (board === undefined || cells === undefined) {
    return (
      <div className="flex flex-col px-4 pt-6 pb-24">
        <p className="text-gray-400 text-sm text-center py-10">Loading board…</p>
      </div>
    )
  }

  if (board === null) {
    return (
      <div className="flex flex-col px-4 pt-6 pb-24">
        <p className="text-gray-400 text-sm text-center py-10">Board not found.</p>
      </div>
    )
  }

  const markedCount = cells.filter(c => c.marked && c.entryId !== null).length
  const totalReal = cells.filter(c => c.entryId !== null).length
  const date = new Date(board.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="flex flex-col px-4 pt-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => navigate('/saved')}
          className="p-1.5 -ml-1.5 text-gray-400 active:text-gray-700"
          aria-label="Back to saved boards"
        >
          <BackIcon />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 leading-tight">
            {board.size}×{board.size} — {MODE_LABELS[board.mode] ?? board.mode}
            {board.difficulty && ` — ${DIFF_LABELS[board.difficulty]}`}
          </p>
          <p className="text-xs text-gray-400">{date} · {markedCount}/{totalReal} marked</p>
        </div>
      </div>

      <BoardGrid cells={cells} size={board.size} onToggle={toggleCell} />
    </div>
  )
}
