import { useState } from 'react'
import { useEntries } from '../hooks/useEntries'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'
import BulkImport from '../components/BulkImport'

export default function Home() {
  const { entries, addEntry, updateEntry, deleteEntry, exportCSV, bulkAddEntries } = useEntries()
  const [editing, setEditing] = useState(null)
  const [showImport, setShowImport] = useState(false)

  async function handleSubmit(data) {
    if (editing) {
      await updateEntry(editing.id, data)
      setEditing(null)
    } else {
      await addEntry(data)
    }
  }

  if (showImport) {
    return (
      <BulkImport
        bulkAddEntries={bulkAddEntries}
        onImport={() => setShowImport(false)}
        onCancel={() => setShowImport(false)}
      />
    )
  }

  return (
    <div className="flex flex-col px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Entries</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="text-xs text-indigo-600 font-medium px-3 py-1.5 rounded-lg bg-indigo-50"
          >
            Bulk Import
          </button>
          {entries?.length > 0 && (
            <button
              onClick={exportCSV}
              className="text-xs text-gray-500 font-medium px-3 py-1.5 rounded-lg bg-gray-100"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      <EntryForm
        initial={editing}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
      />

      <p className="text-xs text-gray-400 mb-3">{entries?.length ?? 0} entries</p>

      <EntryList
        entries={entries}
        onEdit={setEditing}
        onDelete={id => deleteEntry(id)}
      />
    </div>
  )
}
