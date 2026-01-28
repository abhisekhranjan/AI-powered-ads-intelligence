import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Placeholder components - will be implemented in later tasks
const LandingPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-primary-600 mb-4">
        RiseRoutes AI Ads Intelligence Platform
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Fix Your Ads Targeting in Minutes — Not Months
      </p>
      <p className="mt-4 text-gray-500">
        Frontend setup complete. Dashboard and features coming in next tasks.
      </p>
    </div>
  </div>
)

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
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
