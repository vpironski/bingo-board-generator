import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './views/Home'
import Generate from './views/Generate'
import Board from './views/Board'
import SavedBoards from './views/SavedBoards'

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-white">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
            <Route path="/generate" element={<ErrorBoundary><Generate /></ErrorBoundary>} />
            <Route path="/board/:boardId" element={<ErrorBoundary><Board /></ErrorBoundary>} />
            <Route path="/saved" element={<ErrorBoundary><SavedBoards /></ErrorBoundary>} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
