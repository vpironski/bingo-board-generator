/**
 * @param {{ allCategories: string[], selected: string[], onChange: (cat: string) => void }} props
 */
export default function CategoryPicker({ allCategories, selected, onChange }) {
  if (allCategories.length <= 1) return null
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">Categories</p>
      <div className="flex flex-wrap gap-1.5">
        {allCategories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              selected.includes(cat)
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
