const SPREADS = [
  { value: 'A', desc: 'Easy top-left → Hard bottom-right' },
  { value: 'B', desc: 'Random scatter' },
  { value: 'C', desc: 'Easy rows first → Hard rows last' },
  { value: 'D', desc: 'Balanced across rows and columns' },
]

/**
 * @param {{ value: string, onChange: Function }} props
 */
export default function SpreadPicker({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">Spread</p>
      <div className="flex flex-col gap-2">
        {SPREADS.map(s => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${
              value === s.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <span className={`text-sm font-bold w-5 shrink-0 ${value === s.value ? 'text-indigo-600' : 'text-gray-400'}`}>
              {s.value}
            </span>
            <span className="text-xs text-gray-600">{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
