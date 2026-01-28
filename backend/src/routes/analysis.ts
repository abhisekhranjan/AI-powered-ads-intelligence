import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { analysisSessionRepository } from '../models/index.js'
import { websiteAnalyzerService } from '../services/websiteAnalyzer.js'
import { competitorService } from '../services/competitorService.js'
import { targetingService } from '../services/targetingService.js'

const router = Router()

router.post('/analyze', async (req, res) => {
  try {
    const { website_url, target_location, competitor_urls, user_id } = req.body

    // Create session
    const session = await analysisSessionRepository.createSession({
      user_id: user_id || uuidv4(),
      website_url,
      target_location,
      competitor_urls
    })

    // Start analysis (async)
    setImmediate(async () => {
      try {
        await analysisSessionRepository.updateStatus(session.id, 'processing')
        
        // Analyze website
        await websiteAnalyzerService.analyzeWebsite(session.id, website_url)
        
        // Analyze competitors
        if (competitor_urls && competitor_urls.length > 0) {
          await competitorService.analyzeCompetitors(session.id, competitor_urls)
        }
        
        // Generate targeting
        await targetingService.generateMetaTargeting(session.id, {})
        await targetingService.generateGoogleTargeting(session.id, {})
        
        await analysisSessionRepository.updateStatus(session.id, 'completed')
      } catch (error) {
        await analysisSessionRepository.updateStatus(session.id, 'failed')
      }
    })

    res.json({ session_id: session.id, status: 'processing' })
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' })
  }
})

router.get('/session/:id', async (req, res) => {
  try {
    const session = await analysisSessionRepository.findById(req.params.id)
    res.json(session)
  } catch (error) {
    res.status(404).json({ error: 'Session not found' })
  }
})

export default router
