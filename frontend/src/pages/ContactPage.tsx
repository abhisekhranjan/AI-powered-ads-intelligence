import { Target, Mail, Linkedin, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function ContactPage() {
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
            <Link to="/" className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">RiseRoutes</span>
            </Link>
            <Link to="/" className="text-slate-300 hover:text-white transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-300">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Founder Details */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Founder & Product Architect</h2>
            
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                AR
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Abhisekh Ranjan</h3>
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
            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
            
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
                disabled={formStatus === 'success'}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus === 'success' ? 'Message Sent!' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
