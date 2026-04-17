import { useState } from 'react'
import { exportBoard } from '../utils/exportImage'

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
    </svg>
  )
}

/**
 * @param {{ cells: object[], size: number, filename?: string }} props
 */
export default function ExportButton({ cells, size, filename = 'bingo-board' }) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  function handleExport() {
    if (exporting || !cells?.length) return
    setError(null)
    setExporting(true)
    exportBoard(cells, size, filename, {
      onSuccess: () => setExporting(false),
      onError: () => { setError('Could not export. Try again.'); setExporting(false) },
    })
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium active:bg-gray-200 disabled:opacity-40"
      >
        <ShareIcon />
        {exporting ? 'Exporting…' : 'Export'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
