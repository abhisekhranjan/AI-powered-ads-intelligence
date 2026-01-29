import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LandingPage from './pages/LandingPage'
import AnalyzePage from './pages/AnalyzePage'
import DashboardPage from './pages/DashboardPage'
import ContactPage from './pages/ContactPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/dashboard/:sessionId" element={<DashboardPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
