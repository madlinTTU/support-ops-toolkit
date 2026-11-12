import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/Layout'
import { KbCandidatesPage } from '@/pages/kb-candidates-page'
import { QueuePage } from '@/pages/queue-page'

// The statistics page brings the chart library with it, so it is loaded only when somebody opens it.
const StatsPage = lazy(() => import('@/pages/stats-page').then((module) => ({ default: module.StatsPage })))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<QueuePage />} />
          <Route path="kb-candidates" element={<KbCandidatesPage />} />
          <Route
            path="stats"
            element={
              <Suspense fallback={<p className="text-muted">Loading...</p>}>
                <StatsPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
