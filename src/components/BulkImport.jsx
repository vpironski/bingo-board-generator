import { useState, useRef } from 'react'
import { parseCSVFile, downloadTemplate } from '../utils/csvParser'

/**
 * @param {{ bulkAddEntries: Function, onImport: Function, onCancel: Function }} props
 */
export default function BulkImport({ bulkAddEntries, onImport, onCancel }) {
  const [parseResult, setParseResult] = useState(null)
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseResult(null)
    setImportError(null)
    try {
      setParseResult(await parseCSVFile(file))
    } catch (err) {
      setImportError(err.message)
    }
  }

  async function handleImport() {
    if (!parseResult?.valid.length) return
    setImporting(true)
    try {
      await bulkAddEntries(parseResult.valid)
      onImport()
    } catch {
      setImportError('Import failed. Please try again.')
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 font-medium px-3 py-1.5 rounded-lg bg-gray-100"
        >
          Cancel
        </button>
      </div>

      {/* Step 1 — Download template */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-1">Step 1 — Download the template</p>
        <p className="text-xs text-gray-400 mb-4">
          Open it in Numbers, Google Sheets, or Excel. Fill in your entries, then save as CSV.
        </p>
        <button
          onClick={downloadTemplate}
          className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-sm"
        >
          Download Template
        </button>
      </div>

      {/* Step 2 — Upload filled CSV */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">Step 2 — Import your CSV</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="sr-only"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-4 rounded-xl border-2 border-dashed text-sm font-medium transition-colors ${
            fileName
              ? 'border-indigo-400 text-indigo-600 bg-indigo-50'
              : 'border-gray-300 text-gray-400'
          }`}
        >
          {fileName ? fileName : 'Choose CSV file'}
        </button>
      </div>

      {/* Step 3 — Preview + confirm */}
      {parseResult && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          {parseResult.valid.length === 0 && parseResult.skipped.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No entries found in this file.</p>
          ) : (
            <p className="text-sm font-semibold text-gray-800 mb-1">
              {parseResult.valid.length} {parseResult.valid.length === 1 ? 'entry' : 'entries'} ready to import
              {parseResult.skipped.length > 0 && (
                <span className="text-red-500"> · {parseResult.skipped.length} skipped</span>
              )}
            </p>
          )}

          {parseResult.skipped.length > 0 && (
            <ul className="mt-2 mb-4 flex flex-col gap-1">
              {parseResult.skipped.map((reason, i) => (
                <li key={i} className="text-xs text-red-500">{reason}</li>
              ))}
            </ul>
          )}

          {importError && (
            <p className="text-xs text-red-500 mb-3">{importError}</p>
          )}

          <button
            onClick={handleImport}
            disabled={importing || parseResult.valid.length === 0}
            className="w-full py-3 mt-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-40"
          >
            {importing ? 'Importing…' : `Import ${parseResult.valid.length} ${parseResult.valid.length === 1 ? 'Entry' : 'Entries'}`}
          </button>
        </div>
      )}
    </div>
  )
}
