import { Router, Request, Response } from 'express'
import { testConnection } from '../config/database.js'
import { redisClient } from '../config/redis.js'

const router = Router()

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: false,
      redis: false,
    },
  }

  // Check database
  try {
    health.services.database = await testConnection()
  } catch (error) {
    health.services.database = false
  }

  // Check Redis
  try {
    await redisClient.ping()
    health.services.redis = true
  } catch (error) {
    health.services.redis = false
  }

  // Determine overall status
  const allServicesHealthy = Object.values(health.services).every((s) => s)
  health.status = allServicesHealthy ? 'ok' : 'degraded'

  const statusCode = allServicesHealthy ? 200 : 503
  res.status(statusCode).json(health)
})

export default router
