import { Link } from 'react-router-dom'
import { Sparkles, Target, TrendingUp, Zap, Mail, Linkedin, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('idle')
    
    try {
      const response = await fetch('http://localhost:3000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormStatus('success')
        setTimeout(() => {
          setFormStatus('idle')
          setFormData({ name: '', email: '', company: '', message: '' })
        }, 5000)
      } else {
        setFormStatus('error')
        setTimeout(() => setFormStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setFormStatus('error')
      setTimeout(() => setFormStatus('idle'), 5000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }
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
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#insights" className="text-slate-300 hover:text-white transition">Insights</a>
              <Link to="/contact" className="text-slate-300 hover:text-white transition">Contact</Link>
            </nav>
            <Link
              to="/analyze"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">AI-Powered Ads Intelligence</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Fix Your Ads Targeting
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  in Minutes — Not Months
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed">
                Zero learning curve. AI analyzes your website and competitors to generate Meta & Google Ads targeting recommendations with clear explanations of the "why" behind each suggestion.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/analyze"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-500/50"
                >
                  Analyze My Website
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center border-2 border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition"
                >
                  View Sample Report
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 pt-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400">No Guesswork</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400">Policy-Safe</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400">Built for Service Businesses</span>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-6 transform hover:scale-105 transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-slate-500">AI Analysis Dashboard</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Buying Intent</span>
                      <span className="text-lg font-bold text-green-400">+ High</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="text-xs text-blue-300 mb-1">Meta Ads</div>
                      <div className="text-lg font-bold text-white">Ready</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <div className="text-xs text-purple-300 mb-1">Google Ads</div>
                      <div className="text-lg font-bold text-white">Ready</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-blue-500 rounded-full p-3 shadow-lg animate-bounce">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Logos */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="flex items-center justify-center space-x-12 opacity-50">
            <div className="text-2xl font-bold text-slate-400">stripe</div>
            <div className="text-2xl font-bold text-slate-400">Google</div>
            <div className="text-2xl font-bold text-slate-400">Meta</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Win at Ads
            </h2>
            <p className="text-xl text-slate-400">
              From analysis to execution, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI-Powered Analysis</h3>
              <p className="text-slate-400">
                Our AI analyzes your website and competitors to find the perfect audience targeting strategy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Meta & Google Ready</h3>
              <p className="text-slate-400">
                Get targeting recommendations formatted for both Meta Ads and Google Ads platforms.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Export & Share</h3>
              <p className="text-slate-400">
                Export your targeting data as CSV or create client-friendly reports in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Ad Campaigns?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join hundreds of marketers who've improved their targeting with AI
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-500/50"
          >
            Start Free Analysis
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-slate-300">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Founder Details */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Founder & Product Architect</h3>
              
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  AR
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white">Abhisekh Ranjan</h4>
                  <p className="text-slate-400">Founder & Product Architect</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <a href="mailto:contact@riseroutes.com" className="hover:text-white transition">
                    contact@riseroutes.com
                  </a>
                </div>
                
                <div className="flex items-center space-x-3 text-slate-300">
                  <Linkedin className="w-5 h-5 text-blue-400" />
                  <a href="https://www.linkedin.com/in/abhisekhranjan/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    linkedin.com/in/abhisekhranjan
                  </a>
                </div>

                <div className="flex items-center space-x-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>Gurgaon, India</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-700">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Building AI-powered tools to help businesses optimize their ad targeting and grow faster. 
                  With years of experience in digital marketing and AI, I'm passionate about making advanced 
                  targeting accessible to everyone.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
              
              {formStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
                  <p className="text-green-400 text-center font-medium">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              {formStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                  <p className="text-red-400 text-center font-medium">
                    ✗ Failed to send message. Please try again or email us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about your project..."
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-blue-500/50 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Target className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-white">RiseRoutes</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2026 RiseRoutes. AI-Powered Ads Intelligence Platform.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
