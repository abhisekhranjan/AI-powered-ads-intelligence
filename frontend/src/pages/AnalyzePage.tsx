import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AnalyzePage() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [location, setLocation] = useState('United States')
  const [competitors, setCompetitors] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/analysis/analyze', {
        website_url: websiteUrl,
        target_location: location,
        competitor_urls: competitors.split('\n').filter(u => u.trim())
      })

      navigate(`/dashboard/${response.data.session_id}`)
    } catch (error) {
      alert('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-8 text-center">
          Analyze Your Website
        </h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-card-lg p-8 shadow-soft-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-card bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-card bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Competitors (optional, one per line)
            </label>
            <textarea
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="https://competitor1.com&#10;https://competitor2.com"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-card bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-primary-600 text-white rounded-card font-semibold hover:bg-primary-700 transition-colors shadow-soft-lg disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Ads Targeting'}
          </button>
        </form>
      </div>
    </div>
  )
}
