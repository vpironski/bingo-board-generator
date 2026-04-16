import { useNavigate } from 'react-router-dom'
import { useBoard } from '../hooks/useBoard'

const DIFF_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Insane' }
const MODE_LABELS = { 'category': 'Category', 'category+difficulty': 'Cat + Difficulty' }

export default function SavedBoards() {
  const navigate = useNavigate()
  const { savedBoards, deleteBoard } = useBoard()

  async function handleDelete(e, boardId) {
    e.stopPropagation()
    if (!window.confirm('Delete this board?')) return
    await deleteBoard(boardId)
  }

  if (savedBoards === undefined) {
    return (
      <div className="flex flex-col px-4 pt-6 pb-24">
        <p className="text-gray-400 text-sm text-center py-10">Loading…</p>
      </div>
    )
  }

  if (savedBoards.length === 0) {
    return (
      <div className="flex flex-col px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Boards</h1>
        <p className="text-gray-400 text-sm text-center py-10">
          No saved boards yet. Generate one from the Generate tab.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Saved Boards</h1>
      <p className="text-xs text-gray-400 mb-4">{savedBoards.length} {savedBoards.length === 1 ? 'board' : 'boards'}</p>
      <ul className="flex flex-col gap-2">
        {savedBoards.map(board => {
          const date = new Date(board.createdAt).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
          })
          return (
            <li
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 active:bg-gray-50 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium text-sm">
                  {board.size}×{board.size} — {MODE_LABELS[board.mode] ?? board.mode}
                  {board.difficulty ? ` — ${DIFF_LABELS[board.difficulty]}` : ''}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{date}</p>
              </div>
              <button
                type="button"
                onClick={e => handleDelete(e, board.id)}
                className="p-1.5 text-gray-300 active:text-red-500 shrink-0"
                aria-label="Delete board"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
