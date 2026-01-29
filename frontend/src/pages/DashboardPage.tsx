import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Target, Loader2, Download, TrendingUp, Users, Globe, ArrowLeft, 
  Sparkles, CheckCircle, AlertCircle, Copy, FileText, BarChart3,
  ChevronDown, ChevronUp, Info, Zap, AlertTriangle, ThumbsUp
} from 'lucide-react'

interface AnalysisSession {
  id: string
  status: string
  website_url: string
  target_location: string
  website_analyses?: any[]
  competitor_analyses?: any[]
  targeting_recommendations?: TargetingRecommendation[]
}

interface TargetingRecommendation {
  platform: 'meta' | 'google'
  targeting_data: any
}

type TabType = 'overview' | 'meta' | 'google' | 'competitor' | 'fix-my-ads'

export default function DashboardPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState<AnalysisSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [googleSubTab, setGoogleSubTab] = useState<'search' | 'pmax' | 'display'>('search')

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/analysis/session/${sessionId}`)
        if (!response.ok) throw new Error('Failed to fetch session')
        const data = await response.json()
        setSession(data)
        
        if (data.status === 'completed' || data.status === 'failed') {
          setLoading(false)
        }
      } catch (err) {
        setError('Failed to load analysis results')
        setLoading(false)
      }
    }

    fetchSession()
    const interval = setInterval(fetchSession, 3000)
    return () => clearInterval(interval)
  }, [sessionId])

  const metaTargeting = session?.targeting_recommendations?.find(r => r.platform === 'meta')
  const googleTargeting = session?.targeting_recommendations?.find(r => r.platform === 'google')
  const websiteAnalysis = session?.website_analyses?.[0]
  const competitorAnalyses = session?.competitor_analyses || []

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId)
    } else {
      newExpanded.add(cardId)
    }
    setExpandedCards(newExpanded)
  }

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const handleExportCSV = (platform: 'meta' | 'google') => {
    const targeting = platform === 'meta' ? metaTargeting : googleTargeting
    if (!targeting) return

    let csvContent = ''
    
    if (platform === 'meta') {
      csvContent = 'Category,Value,Confidence,Funnel Stage,Recommendation\n'
      
      if (targeting.targeting_data.interests) {
        targeting.targeting_data.interests.forEach((item: any) => {
          const interests = Array.isArray(item.interests) ? item.interests.join('; ') : item.interests
          csvContent += `Interest,"${interests}",${item.confidence || 'N/A'},${item.funnel_stage || 'N/A'},${item.recommendation || 'N/A'}\n`
        })
      }
      
      if (targeting.targeting_data.behaviors) {
        targeting.targeting_data.behaviors.forEach((item: any) => {
          csvContent += `Behavior,"${item.behavior}",${item.confidence || 'N/A'},${item.funnel_stage || 'N/A'},${item.recommendation || 'N/A'}\n`
        })
      }
    } else {
      csvContent = 'Type,Keywords,Intent,Search Volume,Competition,Funnel Stage\n'
      
      if (targeting.targeting_data.keywords) {
        targeting.targeting_data.keywords.forEach((cluster: any) => {
          const keywords = Array.isArray(cluster.keywords) ? cluster.keywords.join('; ') : cluster.keywords
          csvContent += `Keyword,"${keywords}",${cluster.intent || 'N/A'},${cluster.search_volume || 'N/A'},${cluster.competition_level || 'N/A'},${cluster.funnel_stage || 'N/A'}\n`
        })
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${platform}-targeting-${sessionId}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'scale': return 'from-green-500/20 to-emerald-500/10 border-green-500/40'
      case 'test': return 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40'
      case 'avoid': return 'from-red-500/20 to-rose-500/10 border-red-500/40'
      default: return 'from-blue-500/20 to-cyan-500/10 border-blue-500/40'
    }
  }

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'scale': return { icon: <Zap className="w-3 h-3" />, text: 'Scale', color: 'bg-green-500/20 text-green-300 border-green-500/40' }
      case 'test': return { icon: <AlertTriangle className="w-3 h-3" />, text: 'Test', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' }
      case 'avoid': return { icon: <AlertCircle className="w-3 h-3" />, text: 'Avoid', color: 'bg-red-500/20 text-red-300 border-red-500/40' }
      default: return { icon: <ThumbsUp className="w-3 h-3" />, text: 'Good', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' }
    }
  }

  const getFunnelStageBadge = (stage: string) => {
    switch (stage) {
      case 'TOF': return { text: 'Top of Funnel', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', desc: 'Awareness' }
      case 'MOF': return { text: 'Mid Funnel', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', desc: 'Consideration' }
      case 'BOF': return { text: 'Bottom Funnel', color: 'bg-green-500/20 text-green-300 border-green-500/40', desc: 'Conversion' }
      default: return { text: 'Unknown', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', desc: '' }
    }
  }

  if (loading && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-white">Analyzing your website...</p>
          <p className="text-sm text-slate-400 mt-2">This usually takes 30-60 seconds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <Link to="/analyze" className="text-blue-400 hover:text-blue-300">
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">RiseRoutes</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleExportCSV('meta')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <Link to="/contact" className="text-slate-300 hover:text-white transition">
                Contact
              </Link>
              <Link to="/analyze" className="flex items-center space-x-2 text-slate-300 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" />
                <span>New Analysis</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {session?.status === 'processing' && (
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-6 mb-8 animate-pulse">
            <div className="flex items-center space-x-4">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-white">Analysis in Progress</h3>
                <p className="text-slate-300">Analyzing your website and generating targeting recommendations...</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {session?.status === 'completed' && (
          <>
            <div className="mb-8">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('meta')}
                  className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                    activeTab === 'meta'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Meta Ads
                </button>
                <button
                  onClick={() => setActiveTab('google')}
                  className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                    activeTab === 'google'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Google Ads
                </button>
                <button
                  onClick={() => setActiveTab('competitor')}
                  className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                    activeTab === 'competitor'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Competitor Insights
                </button>
                <button
                  onClick={() => setActiveTab('fix-my-ads')}
                  className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === 'fix-my-ads'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Fix My Ads</span>
                </button>
              </div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Ideal Customer Snapshot */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-400" />
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute right-0 top-6 w-48 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                          Who your ideal customer is
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Ideal Customer</h3>
                    <p className="text-slate-300 text-sm">
                      {websiteAnalysis?.business_model || 'Service-based business owners'}
                    </p>
                  </div>

                  {/* Buying Intent Level */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute right-0 top-6 w-48 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                          How ready they are to buy
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Buying Intent</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-green-400 font-semibold">High</span>
                    </div>
                  </div>

                  {/* Funnel Readiness */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <BarChart3 className="w-8 h-8 text-purple-400" />
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute right-0 top-6 w-48 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                          Which funnel stage to target
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Funnel Stage</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/40">TOF</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/40">MOF</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/40">BOF</span>
                    </div>
                  </div>

                  {/* Platform Fit */}
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Globe className="w-8 h-8 text-orange-400" />
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute right-0 top-6 w-48 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                          Best platform for your business
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Platform Fit</h3>
                    <p className="text-slate-300 text-sm">Meta + Google</p>
                    <p className="text-xs text-slate-400 mt-1">Both platforms recommended</p>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-semibold text-white">Key Insights</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">Your ads likely fail because:</p>
                        <p className="text-slate-300 text-sm">Targeting too broad - not reaching high-intent buyers</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">What you should do instead:</p>
                        <p className="text-slate-300 text-sm">Focus on bottom-funnel audiences with specific pain points</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* META ADS TAB */}
            {activeTab === 'meta' && metaTargeting && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Meta Ads Targeting</h2>
                  <button
                    onClick={() => handleExportCSV('meta')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Interests */}
                {metaTargeting.targeting_data.interests && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Interest Targeting</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {metaTargeting.targeting_data.interests.map((item: any, idx: number) => {
                        const cardId = `interest-${idx}`
                        const isExpanded = expandedCards.has(cardId)
                        const recBadge = getRecommendationBadge(item.recommendation || 'test')
                        const funnelBadge = getFunnelStageBadge(item.funnel_stage || 'MOF')

                        return (
                          <div
                            key={idx}
                            className={`bg-gradient-to-br ${getRecommendationColor(item.recommendation || 'test')} border rounded-xl p-6 cursor-pointer transition hover:shadow-lg`}
                            onClick={() => toggleCard(cardId)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${recBadge.color}`}>
                                    {recBadge.icon}
                                    <span>{recBadge.text}</span>
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${funnelBadge.color}`}>
                                    {funnelBadge.text}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {(Array.isArray(item.interests) ? item.interests : [item.interests]).map((interest: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-200 rounded-lg text-sm">
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                                {item.why_this_converts && (
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-1">Why This Converts:</p>
                                    <p className="text-sm text-slate-300">{item.why_this_converts}</p>
                                  </div>
                                )}
                                {item.reasoning && (
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-1">AI Reasoning:</p>
                                    <p className="text-sm text-slate-300">{item.reasoning}</p>
                                  </div>
                                )}
                                {item.creative_angle && (
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-1">Creative Angle:</p>
                                    <p className="text-sm text-slate-300">{item.creative_angle}</p>
                                  </div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopy(JSON.stringify(item, null, 2), cardId)
                                  }}
                                  className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedSection === cardId ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Behaviors */}
                {metaTargeting.targeting_data.behaviors && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Behavior Targeting</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {metaTargeting.targeting_data.behaviors.map((item: any, idx: number) => {
                        const cardId = `behavior-${idx}`
                        const isExpanded = expandedCards.has(cardId)
                        const recBadge = getRecommendationBadge(item.recommendation || 'test')
                        const funnelBadge = getFunnelStageBadge(item.funnel_stage || 'MOF')

                        return (
                          <div
                            key={idx}
                            className={`bg-gradient-to-br ${getRecommendationColor(item.recommendation || 'test')} border rounded-xl p-6 cursor-pointer transition hover:shadow-lg`}
                            onClick={() => toggleCard(cardId)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${recBadge.color}`}>
                                    {recBadge.icon}
                                    <span>{recBadge.text}</span>
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${funnelBadge.color}`}>
                                    {funnelBadge.text}
                                  </span>
                                </div>
                                <p className="text-white font-medium mt-2">{item.behavior}</p>
                              </div>
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                                {item.why_this_converts && (
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-1">Why This Converts:</p>
                                    <p className="text-sm text-slate-300">{item.why_this_converts}</p>
                                  </div>
                                )}
                                {item.reasoning && (
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-1">AI Reasoning:</p>
                                    <p className="text-sm text-slate-300">{item.reasoning}</p>
                                  </div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopy(JSON.stringify(item, null, 2), cardId)
                                  }}
                                  className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedSection === cardId ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GOOGLE ADS TAB */}
            {activeTab === 'google' && googleTargeting && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Google Ads Targeting</h2>
                  <button
                    onClick={() => handleExportCSV('google')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center space-x-2 mb-6">
                  <button
                    onClick={() => setGoogleSubTab('search')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      googleSubTab === 'search'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Search
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('pmax')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      googleSubTab === 'pmax'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Performance Max
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('display')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      googleSubTab === 'display'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Display / YouTube
                  </button>
                </div>

                {/* Keywords */}
                {googleSubTab === 'search' && googleTargeting.targeting_data.keywords && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Keyword Clusters</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {googleTargeting.targeting_data.keywords.map((cluster: any, idx: number) => {
                        const cardId = `keyword-${idx}`
                        const isExpanded = expandedCards.has(cardId)
                        const funnelBadge = getFunnelStageBadge(cluster.funnel_stage || 'MOF')
                        
                        const intentColor = cluster.intent === 'high' 
                          ? 'bg-green-500/20 text-green-300 border-green-500/40'
                          : cluster.intent === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/40'

                        return (
                          <div
                            key={idx}
                            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-xl p-6 cursor-pointer transition hover:shadow-lg"
                            onClick={() => toggleCard(cardId)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${intentColor}`}>
                                    {cluster.intent?.toUpperCase() || 'MEDIUM'} Intent
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${funnelBadge.color}`}>
                                    {funnelBadge.text}
                                  </span>
                                  {cluster.match_type && (
                                    <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                                      {cluster.match_type}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {(Array.isArray(cluster.keywords) ? cluster.keywords : [cluster.keywords]).map((keyword: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-200 rounded-lg text-sm">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                                {cluster.reasoning && (
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-1">Why These Keywords:</p>
                                    <p className="text-sm text-slate-300">{cluster.reasoning}</p>
                                  </div>
                                )}
                                {cluster.negative_keywords && (
                                  <div>
                                    <p className="text-sm font-semibold text-red-400 mb-1 flex items-center space-x-1">
                                      <AlertTriangle className="w-4 h-4" />
                                      <span>Negative Keywords:</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {(Array.isArray(cluster.negative_keywords) ? cluster.negative_keywords : [cluster.negative_keywords]).map((neg: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                                          -{neg}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopy(JSON.stringify(cluster, null, 2), cardId)
                                  }}
                                  className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedSection === cardId ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {googleSubTab === 'pmax' && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                    <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Performance Max Recommendations</h3>
                    <p className="text-slate-300">Use the audience signals from Meta Ads tab for your Performance Max campaigns</p>
                  </div>
                )}

                {googleSubTab === 'display' && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                    <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Display & YouTube Targeting</h3>
                    <p className="text-slate-300">Use interest and behavior targeting from Meta Ads tab for Display campaigns</p>
                  </div>
                )}
              </div>
            )}

            {/* COMPETITOR TAB */}
            {activeTab === 'competitor' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Competitor Intelligence</h2>
                
                {competitorAnalyses.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {competitorAnalyses.map((comp: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">{comp.competitor_url}</h3>
                        
                        {comp.analysis_data?.interests && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-300 mb-2">Their Audience Interests:</p>
                            <div className="flex flex-wrap gap-2">
                              {comp.analysis_data.interests.slice(0, 5).map((interest: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {comp.analysis_data?.keywords && (
                          <div>
                            <p className="text-sm font-semibold text-slate-300 mb-2">Their Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                              {comp.analysis_data.keywords.slice(0, 5).map((keyword: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <div className="flex items-center space-x-2 text-sm text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Opportunity: Target their audience with better messaging</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Competitor Data</h3>
                    <p className="text-slate-300">Add competitor URLs in your next analysis to see their targeting insights</p>
                  </div>
                )}
              </div>
            )}

            {/* FIX MY ADS TAB */}
            {activeTab === 'fix-my-ads' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Fix My Ads - Diagnostic</h2>

                {/* What You're Likely Doing Wrong */}
                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-semibold text-white">What You're Likely Doing Wrong</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-400 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Targeting Too Broad</p>
                        <p className="text-slate-300 text-sm">Using generic interests like "Business" or "Entrepreneurship" that reach millions of unqualified people</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-400 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Wrong Funnel Stage</p>
                        <p className="text-slate-300 text-sm">Showing bottom-funnel offers to cold audiences who don't know you yet</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-400 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Low-Intent Keywords</p>
                        <p className="text-slate-300 text-sm">Bidding on informational keywords when you need transactional buyers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What You Should Do Instead */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold text-white">What You Should Do Instead</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Use Specific, High-Intent Interests</p>
                        <p className="text-slate-300 text-sm mb-2">Target people actively looking for solutions like yours</p>
                        <div className="flex flex-wrap gap-2">
                          {metaTargeting?.targeting_data.interests?.slice(0, 3).map((item: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                              {Array.isArray(item.interests) ? item.interests[0] : item.interests}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Match Funnel Stage to Offer</p>
                        <p className="text-slate-300 text-sm">Start with TOF awareness content, nurture with MOF, convert with BOF</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Focus on Buyer-Intent Keywords</p>
                        <p className="text-slate-300 text-sm mb-2">Target keywords that show purchase intent</p>
                        <div className="flex flex-wrap gap-2">
                          {googleTargeting?.targeting_data.keywords?.slice(0, 3).map((cluster: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                              {Array.isArray(cluster.keywords) ? cluster.keywords[0] : cluster.keywords}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Priority */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Priority Actions (Highest Impact First)</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-bold">HIGH</span>
                        <span className="text-white">Switch to bottom-funnel audiences immediately</span>
                      </div>
                      <span className="text-green-400 font-semibold">+40% ROAS</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-bold">MED</span>
                        <span className="text-white">Add negative keywords to filter out tire-kickers</span>
                      </div>
                      <span className="text-green-400 font-semibold">+25% ROAS</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-bold">LOW</span>
                        <span className="text-white">Test competitor audience targeting</span>
                      </div>
                      <span className="text-green-400 font-semibold">+15% ROAS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
