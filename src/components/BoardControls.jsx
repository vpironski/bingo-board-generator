import { useState, useEffect, useMemo } from 'react'
import { DIFFICULTY_LABELS } from '../logic/boardBuilder'
import SpreadPicker from './SpreadPicker'
import CategoryPicker from './CategoryPicker'

const SIZES = [3, 5, 7, 9]

/**
 * @param {{ entries: import('../hooks/useEntries').Entry[]|undefined, onGenerate: Function, generating: boolean }} props
 */
export default function BoardControls({ entries, onGenerate, generating = false }) {
  const [size, setSize] = useState(5)
  const [mode, setMode] = useState('category')
  const [difficulty, setDifficulty] = useState(2)
  const [spread, setSpread] = useState('B')
  const [freeCenter, setFreeCenter] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState([])

  const allCategories = useMemo(() =>
    [...new Set((entries ?? []).flatMap(e => e.categories ?? []))].sort()
  , [entries])

  useEffect(() => {
    setSelectedCategories(allCategories)
  }, [allCategories.join('|')])  // eslint-disable-line react-hooks/exhaustive-deps

  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? (prev.length > 1 ? prev.filter(c => c !== cat) : prev)
        : [...prev, cat]
    )
  }

  const filteredCount = useMemo(() =>
    (entries ?? []).filter(e => (e.categories ?? []).some(c => selectedCategories.includes(c))).length
  , [entries, selectedCategories])

  const realCells = size * size - (freeCenter ? 1 : 0)
  const noEntries = filteredCount === 0
  const tooSmall = filteredCount > 0 && filteredCount < Math.ceil(realCells / 2)

  return (
    <div className="flex flex-col gap-5">
      <CategoryPicker allCategories={allCategories} selected={selectedCategories} onChange={toggleCategory} />

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Board Size</p>
        <div className="flex gap-2">
          {SIZES.map(s => (
            <button key={s} type="button" onClick={() => setSize(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${size === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Mode</p>
        <div className="flex gap-2">
          {[['category', 'Category'], ['category+difficulty', 'Cat + Difficulty']].map(([val, label]) => (
            <button key={val} type="button" onClick={() => setMode(val)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${mode === val ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'category+difficulty' && (
        <>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Difficulty</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(d => (
                <button key={d} type="button" onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${difficulty === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
          <SpreadPicker value={spread} onChange={setSpread} />
        </>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Free Center</p>
        <button type="button" onClick={() => setFreeCenter(v => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors ${freeCenter ? 'bg-indigo-600' : 'bg-gray-200'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${freeCenter ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {tooSmall && (
        <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">
            Only {filteredCount} {filteredCount === 1 ? 'entry' : 'entries'} for {realCells} cells — some will repeat.
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={noEntries || generating}
        onClick={() => onGenerate({ size, mode, freeCenter, selectedCategories,
          difficulty: mode === 'category+difficulty' ? difficulty : null,
          spread: mode === 'category+difficulty' ? spread : null,
        })}
        className="py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base disabled:opacity-40"
      >
        {generating ? 'Generating…' : 'Generate Board'}
      </button>

      {noEntries && (
        <p className="text-xs text-gray-400 text-center -mt-3">
          {(entries?.length ?? 0) === 0 ? 'Add entries first.' : 'No entries match the selected categories.'}
        </p>
      )}
    </div>
  )
}
