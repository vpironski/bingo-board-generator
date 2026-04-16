import { useParams } from 'react-router-dom'

export default function Board() {
  const { boardId } = useParams()

  return (
    <div className="flex flex-col px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Board</h1>
      <p className="text-gray-400 text-sm">Board #{boardId}</p>
    </div>
  )
}
