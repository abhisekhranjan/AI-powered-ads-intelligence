import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Globe, MapPin, Users, Loader2, ArrowRight, Target, Sparkles } from 'lucide-react'

export default function AnalyzePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [formData, setFormData] = useState({
    website_url: '',
    target_location: 'United States',
    keywords: '',
    competitor_urls: ''
  })

  const thinkingMessages = [
    'Understanding your service…',
    'Analyzing website content…',
    'Mapping buyer intent…',
    'Identifying target audiences…',
    'Analyzing competitor audiences…',
    'Finding high-intent interests…',
    'Generating Meta Ads targeting…',
    'Creating Google Ads recommendations…',
    'Finalizing insights…',
    'This may take 20-30 seconds, hang tight!',
    'AI is working hard on your analysis…',
    'Almost there, crafting perfect targeting…',
    'Quality insights take a moment…',
    'Worth the wait - generating premium recommendations…'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setLoadingProgress(0)
    setThinkingMessage('Starting analysis...')

    try {
      const response = await fetch('http://localhost:3000/api/analysis/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_url: formData.website_url,
          target_location: formData.target_location,
          keywords: formData.keywords
            ? formData.keywords.split(',').map(k => k.trim()).filter(k => k)
            : [],
          competitor_urls: formData.competitor_urls
            ? formData.competitor_urls.split('\n').filter(url => url.trim())
            : []
        })
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to start analysis')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let sessionId = ''

      const stepMessages: Record<string, string> = {
        'init': 'Starting analysis...',
        'session_created': 'Session created',
        'extracting_website': '📄 Extracting website content...',
        'website_extracted': '✅ Website content extracted',
        'analyzing_competitors': '🔍 Analyzing competitors...',
        'competitors_analyzed': '✅ Competitors analyzed',
        'generating_demographics': '👥 Generating target demographics...',
        'generating_interests': '💡 Generating audience interests...',
        'generating_behaviors': '🎯 Generating audience behaviors...',
        'meta_targeting_complete': '✅ Meta Ads targeting complete',
        'generating_keywords': '🔑 Generating Google Ads keywords...',
        'google_targeting_complete': '✅ Google Ads targeting complete',
        'complete': '🎉 Analysis complete!'
      }

      const progressMap: Record<string, number> = {
        'init': 5,
        'session_created': 10,
        'extracting_website': 20,
        'website_extracted': 30,
        'analyzing_competitors': 40,
        'competitors_analyzed': 45,
        'generating_demographics': 50,
        'generating_interests': 65,
        'generating_behaviors': 75,
        'meta_targeting_complete': 85,
        'generating_keywords': 90,
        'google_targeting_complete': 95,
        'complete': 100
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (stepMessages[data.step]) {
                setThinkingMessage(stepMessages[data.step])
              }

              if (progressMap[data.step]) {
                setLoadingProgress(progressMap[data.step])
              }

              if (data.data?.session_id) {
                sessionId = data.data.session_id
              }

              if (data.step === 'complete' && sessionId) {
                setTimeout(() => {
                  navigate(`/dashboard/${sessionId}`)
                }, 500)
              }

              if (data.step === 'error') {
                setError(data.message || 'Analysis failed. Please try again.')
                setLoading(false)
                return
              }
            } catch (err) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

    } catch (err) {
      setError('Failed to connect to server. Please try again.')
      setLoading(false)
      setLoadingProgress(0)
    }
  }

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
    'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden',
    'Norway', 'Denmark', 'Finland', 'Ireland', 'Portugal', 'Poland', 'Czech Republic',
    'India', 'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'Malaysia', 'Thailand',
    'Indonesia', 'Philippines', 'Vietnam', 'United Arab Emirates', 'Saudi Arabia',
    'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru', 'South Africa',
    'Nigeria', 'Kenya', 'Egypt', 'Morocco', 'Israel', 'Turkey', 'Greece', 'Romania',
    'Hungary', 'Bulgaria', 'Croatia', 'New Zealand'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">RiseRoutes</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/contact" className="text-slate-300 hover:text-white transition">
                Contact
              </Link>
              <Link to="/" className="text-slate-300 hover:text-white transition">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Analyze Your Ads Targeting
          </h1>
          <p className="text-xl text-slate-300">
            Enter your website URL to get AI-powered targeting recommendations
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Website URL *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  required
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Keywords/Products */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Keywords or Products (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Sparkles className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., plumbing services, emergency repairs, water heaters"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Add specific keywords to get focused targeting for your products or services (comma-separated)
              </p>
            </div>

            {/* Target Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={formData.target_location}
                  onChange={(e) => setFormData({ ...formData, target_location: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Competitor URLs */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Competitor URLs (optional, one per line)
              </label>
              <div className="relative">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  value={formData.competitor_urls}
                  onChange={(e) => setFormData({ ...formData, competitor_urls: e.target.value })}
                  placeholder="https://competitor1.com&#10;https://competitor2.com"
                  rows={4}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{thinkingMessage || 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <span>Analyze Ads Targeting</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            {/* Progress Bar */}
            {loading && (
              <div className="space-y-2">
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-400">
                  Please wait while we analyze your website and generate targeting recommendations
                </p>
              </div>
            )}
          </form>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-slate-700">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">AI-Powered</h3>
              <p className="text-xs text-slate-400">Advanced algorithms analyze your site</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Policy-Safe</h3>
              <p className="text-xs text-slate-400">All recommendations comply with ad policies</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Fast Results</h3>
              <p className="text-xs text-slate-400">Get insights in seconds, not hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
