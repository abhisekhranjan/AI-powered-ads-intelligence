import { Router } from 'express'
import { exportService } from '../services/exportService.js'
import { targetingRecommendationRepository } from '../models/index.js'

const router = Router()

router.get('/meta/:sessionId', async (req, res) => {
  try {
    const targeting = await targetingRecommendationRepository.findBySessionAndPlatform(req.params.sessionId, 'meta')
    const csv = await exportService.exportMetaCSV(req.params.sessionId, targeting)
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=meta_export.csv`)
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: 'Export failed' })
  }
})

router.get('/google/:sessionId', async (req, res) => {
  try {
    const targeting = await targetingRecommendationRepository.findBySessionAndPlatform(req.params.sessionId, 'google')
    const csv = await exportService.exportGoogleCSV(req.params.sessionId, targeting)
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=google_export.csv`)
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: 'Export failed' })
  }
})

export default router
