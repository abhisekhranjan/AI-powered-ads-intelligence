import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function DashboardPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(`/api/analysis/session/${sessionId}`)
        setSession(response.data)
      } catch (error) {
        console.error('Failed to fetch session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
    const interval = setInterval(fetchSession, 3000)
    return () => clearInterval(interval)
  }, [sessionId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading analysis...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Analysis Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <p className="text-2xl font-bold text-primary-600">{session?.status}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-2">Website</h3>
            <p className="text-sm truncate">{session?.website_url}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p className="text-sm">{session?.target_location || 'Not specified'}</p>
          </div>
        </div>

        {session?.status === 'completed' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-soft">
              <h2 className="text-2xl font-bold mb-4">Meta Ads Targeting</h2>
              <p>Targeting recommendations will appear here</p>
              <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-card">
                Export Meta CSV
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-soft">
              <h2 className="text-2xl font-bold mb-4">Google Ads Targeting</h2>
              <p>Keyword recommendations will appear here</p>
              <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-card">
                Export Google CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
