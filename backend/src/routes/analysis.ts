import { Router } from 'express'
import { analysisSessionRepository } from '../models/index.js'
import { websiteAnalyzerService } from '../services/websiteAnalyzer.js'
import { competitorService } from '../services/competitorService.js'
import { targetingService } from '../services/targetingService.js'
import { logger } from '../config/logger.js'

const router = Router()

// Streaming analysis endpoint with real-time progress
router.post('/analyze-stream', async (req, res) => {
  try {
    const { website_url, target_location, competitor_urls, keywords, user_id } = req.body

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const sendProgress = (step: string, message: string, data?: any) => {
      res.write(`data: ${JSON.stringify({ step, message, data })}\n\n`)
    }

    try {
      sendProgress('init', 'Starting analysis...')
      
      const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'

      // Create session
      const session = await analysisSessionRepository.createSession({
        user_id: user_id || GUEST_USER_ID,
        website_url,
        target_location,
        competitor_urls,
        keywords
      })

      sendProgress('session_created', 'Session created', { session_id: session.id })
      await analysisSessionRepository.updateStatus(session.id, 'processing')

      // Step 1: Extract website content
      sendProgress('extracting_website', 'Extracting website content...')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit delay
      
      const websiteAnalysis = await websiteAnalyzerService.analyzeWebsite(session.id, website_url)
      sendProgress('website_extracted', 'Website content extracted', {
        title: websiteAnalysis.title,
        business_model: websiteAnalysis.business_model
      })

      // Step 2: Analyze competitors (if provided)
      if (competitor_urls && competitor_urls.length > 0) {
        sendProgress('analyzing_competitors', `Analyzing ${competitor_urls.length} competitors...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit delay
        
        await competitorService.analyzeCompetitors(session.id, competitor_urls)
        sendProgress('competitors_analyzed', 'Competitor analysis complete')
      }

      // Step 3: Generate demographics
      sendProgress('generating_demographics', 'Generating target demographics...')
      await new Promise(resolve => setTimeout(resolve, 1500)) // Rate limit delay

      // Step 4: Generate interests
      sendProgress('generating_interests', 'Generating audience interests...')
      await new Promise(resolve => setTimeout(resolve, 1500)) // Rate limit delay

      // Step 5: Generate behaviors
      sendProgress('generating_behaviors', 'Generating audience behaviors...')
      await new Promise(resolve => setTimeout(resolve, 1500)) // Rate limit delay

      // Generate Meta targeting
      await targetingService.generateMetaTargeting(session.id, websiteAnalysis, keywords)
      sendProgress('meta_targeting_complete', 'Meta Ads targeting generated')

      // Step 6: Generate Google keywords
      sendProgress('generating_keywords', 'Generating Google Ads keywords...')
      await new Promise(resolve => setTimeout(resolve, 1500)) // Rate limit delay

      // Generate Google targeting
      await targetingService.generateGoogleTargeting(session.id, websiteAnalysis, keywords)
      sendProgress('google_targeting_complete', 'Google Ads targeting generated')

      // Complete
      await analysisSessionRepository.updateStatus(session.id, 'completed')
      sendProgress('complete', 'Analysis complete!', { session_id: session.id })

      res.end()
    } catch (error) {
      logger.error('Streaming analysis error:', error)
      sendProgress('error', error instanceof Error ? error.message : 'Analysis failed')
      res.end()
    }
  } catch (error) {
    logger.error('Analysis stream endpoint error:', error)
    res.status(500).json({ error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' })
  }
})

router.post('/analyze', async (req, res) => {
  try {
    const { website_url, target_location, competitor_urls, keywords, user_id } = req.body

    logger.info(`Starting analysis for: ${website_url}`)

    // Use guest user ID if no user_id provided
    const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'

    // Create session
    const session = await analysisSessionRepository.createSession({
      user_id: user_id || GUEST_USER_ID,
      website_url,
      target_location,
      competitor_urls,
      keywords
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
        // Pass keywords to targeting service if provided
        await targetingService.generateMetaTargeting(session.id, websiteAnalysis, keywords)
        logger.info(`Meta targeting generated for session: ${session.id}`)
        
        await targetingService.generateGoogleTargeting(session.id, websiteAnalysis, keywords)
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

      return res.json({
        ...session,
        website_analyses: websiteAnalyses,
        competitor_analyses: competitorAnalyses,
        targeting_recommendations: targetingRecommendations
      })
    } else {
      return res.json(session)
    }
  } catch (error) {
    logger.error('Session fetch error:', error)
    return res.status(404).json({ error: 'Session not found' })
  }
})

export default router
