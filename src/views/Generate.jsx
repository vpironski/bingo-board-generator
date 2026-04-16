import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useBoard } from '../hooks/useBoard'
import BoardControls from '../components/BoardControls'

export default function Generate() {
  const navigate = useNavigate()
  const { entries } = useEntries()
  const { generateBoard } = useBoard()
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  async function handleGenerate({ selectedCategories, ...boardOptions }) {
    if (generating) return
    setError(null)
    setGenerating(true)
    try {
      const pool = selectedCategories?.length
        ? (entries ?? []).filter(e => (e.categories ?? []).some(c => selectedCategories.includes(c)))
        : (entries ?? [])
      const boardId = await generateBoard(pool, boardOptions)
      navigate(`/board/${boardId}`)
    } catch (err) {
      setError('Failed to generate board. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Board</h1>
      {error && (
        <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
      <BoardControls entries={entries} onGenerate={handleGenerate} generating={generating} />
    </div>
  )
}
