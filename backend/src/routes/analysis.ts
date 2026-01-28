import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { analysisSessionRepository } from '../models/index.js'
import { websiteAnalyzerService } from '../services/websiteAnalyzer.js'
import { competitorService } from '../services/competitorService.js'
import { targetingService } from '../services/targetingService.js'
import { logger } from '../config/logger.js'

const router = Router()

router.post('/analyze', async (req, res) => {
  try {
    const { website_url, target_location, competitor_urls, user_id } = req.body

    logger.info(`Starting analysis for: ${website_url}`)

    // Use guest user ID if no user_id provided
    const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'

    // Create session
    const session = await analysisSessionRepository.createSession({
      user_id: user_id || GUEST_USER_ID,
      website_url,
      target_location,
      competitor_urls
    })

    logger.info(`Session created: ${session.id}`)

    // Start analysis (async)
    setImmediate(async () => {
      try {
        await analysisSessionRepository.updateStatus(session.id, 'processing')
        
        // Analyze website - WAIT for completion
        const websiteAnalysis = await websiteAnalyzerService.analyzeWebsite(session.id, website_url)
        logger.info(`Website analysis completed for session: ${session.id}`)
        
        // Analyze competitors if provided
        if (competitor_urls && competitor_urls.length > 0) {
          await competitorService.analyzeCompetitors(session.id, competitor_urls)
          logger.info(`Competitor analysis completed for session: ${session.id}`)
        }
        
        // Generate targeting - AFTER website analysis is done
        await targetingService.generateMetaTargeting(session.id, websiteAnalysis)
        logger.info(`Meta targeting generated for session: ${session.id}`)
        
        await targetingService.generateGoogleTargeting(session.id, websiteAnalysis)
        logger.info(`Google targeting generated for session: ${session.id}`)
        
        await analysisSessionRepository.updateStatus(session.id, 'completed')
        logger.info(`Analysis completed for session: ${session.id}`)
      } catch (error) {
        logger.error(`Analysis failed for session ${session.id}:`, error)
        await analysisSessionRepository.updateStatus(session.id, 'failed')
      }
    })

    res.json({ session_id: session.id, status: 'processing' })
  } catch (error) {
    logger.error('Analysis endpoint error:', error)
    res.status(500).json({ error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' })
  }
})

router.get('/session/:id', async (req, res) => {
  try {
    const session = await analysisSessionRepository.findById(req.params.id)
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // If completed, fetch all related data
    if (session.status === 'completed') {
      const [websiteAnalyses, competitorAnalyses, targetingRecommendations] = await Promise.all([
        websiteAnalyzerService.getAnalysesBySession(req.params.id),
        competitorService.getAnalysesBySession(req.params.id),
        targetingService.getRecommendationsBySession(req.params.id)
      ])

      res.json({
        ...session,
        website_analyses: websiteAnalyses,
        competitor_analyses: competitorAnalyses,
        targeting_recommendations: targetingRecommendations
      })
    } else {
      res.json(session)
    }
  } catch (error) {
    logger.error('Session fetch error:', error)
    res.status(404).json({ error: 'Session not found' })
  }
})

export default router
