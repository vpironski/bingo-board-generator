import { useState, useEffect } from 'react'

const DIFFICULTIES = [1, 2, 3, 4, 5]

/**
 * @param {{ initial: import('../hooks/useEntries').Entry|null, onSubmit: Function, onCancel: Function }} props
 */
export default function EntryForm({ initial = null, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState(3)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setCategory(initial.category)
      setDifficulty(initial.difficulty)
    } else {
      setName('')
      setCategory('')
      setDifficulty(3)
    }
  }, [initial])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !category.trim()) return
    onSubmit({ name, category, difficulty })
    if (!initial) {
      setName('')
      setCategory('')
      setDifficulty(3)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-col gap-3">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base"
        required
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="w-full px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base"
        required
      />
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Difficulty</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                difficulty === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        {initial && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
        >
          {initial ? 'Update' : 'Add Entry'}
        </button>
      </div>
    </form>
  )
}
