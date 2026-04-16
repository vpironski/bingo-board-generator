import { useState, useEffect, useRef } from 'react'

const DIFFICULTIES = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
  { value: 4, label: 'Insane' },
]

/**
 * @param {{ initial: import('../hooks/useEntries').Entry|null, onSubmit: Function, onCancel: Function }} props
 */
export default function EntryForm({ initial = null, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [categories, setCategories] = useState([])
  const [catInput, setCatInput] = useState('')
  const [difficulty, setDifficulty] = useState(2)
  const inputRef = useRef(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setCategories(initial.categories ?? [])
      setDifficulty(initial.difficulty)
    } else {
      setName('')
      setCategories([])
      setCatInput('')
      setDifficulty(2)
    }
  }, [initial])

  function addCategory(raw) {
    const trimmed = raw.trim()
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed])
    }
    setCatInput('')
  }

  function handleCatKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCategory(catInput)
    } else if (e.key === 'Backspace' && catInput === '' && categories.length > 0) {
      setCategories(prev => prev.slice(0, -1))
    }
  }

  function removeCategory(cat) {
    setCategories(prev => prev.filter(c => c !== cat))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const finalCats = catInput.trim()
      ? [...categories, catInput.trim()].filter((c, i, arr) => arr.indexOf(c) === i)
      : categories
    if (!name.trim() || finalCats.length === 0) return
    onSubmit({ name, categories: finalCats, difficulty })
    if (!initial) {
      setName('')
      setCategories([])
      setCatInput('')
      setDifficulty(2)
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
      <div
        className="flex flex-wrap gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 min-h-[48px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {categories.map(cat => (
          <span
            key={cat}
            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {cat}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeCategory(cat) }}
              className="text-indigo-400 hover:text-indigo-700 leading-none"
              aria-label={`Remove ${cat}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          placeholder={categories.length === 0 ? 'Category (Enter to add)' : ''}
          value={catInput}
          onChange={e => setCatInput(e.target.value)}
          onKeyDown={handleCatKeyDown}
          onBlur={() => { if (catInput.trim()) addCategory(catInput) }}
          className="flex-1 min-w-[120px] bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none py-1"
        />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Difficulty</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                difficulty === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {label}
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
