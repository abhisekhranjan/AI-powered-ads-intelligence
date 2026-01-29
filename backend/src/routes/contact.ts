import { Router } from 'express'
import { emailService } from '../services/emailService.js'
import { logger } from '../config/logger.js'

const router = Router()

router.post('/submit', async (req, res) => {
  try {
    const { name, email, company, message } = req.body

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, email, and message are required' 
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please provide a valid email address' 
      })
    }

    logger.info(`Contact form submission from: ${email}`)

    // Send emails
    const [notificationSent, autoReplySent] = await Promise.all([
      emailService.sendContactFormEmail({ name, email, company, message }),
      emailService.sendAutoReplyEmail({ name, email, company, message })
    ])

    if (!notificationSent) {
      logger.warn('Failed to send notification email')
    }

    if (!autoReplySent) {
      logger.warn('Failed to send auto-reply email')
    }

    // Return success even if emails fail (don't expose email issues to user)
    res.json({ 
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.' 
    })
  } catch (error) {
    logger.error('Contact form submission error:', error)
    res.status(500).json({ 
      error: 'Submission failed',
      message: 'Something went wrong. Please try again later.' 
    })
  }
})

export default router
