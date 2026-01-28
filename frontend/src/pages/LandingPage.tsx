import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-primary-600 dark:text-primary-400 mb-6">
            Fix Your Ads Targeting in Minutes — Not Months
          </h1>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            AI finds the right interests, audiences & behaviors for Meta & Google Ads using your website + competitors.
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/analyze')}
              className="px-8 py-4 bg-primary-600 text-white rounded-card font-semibold hover:bg-primary-700 transition-colors shadow-soft-lg"
            >
              Analyze My Website
            </button>
            <button
              onClick={() => navigate('/sample')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-card font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-soft"
            >
              View Sample Report
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {['No Guesswork', 'Policy-Safe', 'Built for Service Businesses', 'Meta + Google Ready'].map((feature) => (
              <div key={feature} className="bg-white dark:bg-gray-800 rounded-card p-4 shadow-soft">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
