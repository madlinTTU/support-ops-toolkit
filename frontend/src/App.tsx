import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/Layout'
import { KbCandidatesPage } from '@/pages/kb-candidates-page'
import { QueuePage } from '@/pages/queue-page'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<QueuePage />} />
          <Route path="kb-candidates" element={<KbCandidatesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
