import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import analysisRouter from './routes/analysis.js'
import exportRouter from './routes/export.js'
import contactRouter from './routes/contact.js'

// Create Express application
export function createApp(): Application {
  const app = express()

  // Security middleware
  app.use(helmet())
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  )

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Rate limiting
  app.use(config.apiPrefix, apiLimiter)

  // Health check route (no prefix)
  app.use(healthRouter)

  // API routes
  app.use(`${config.apiPrefix}/auth`, authRouter)
  app.use(`${config.apiPrefix}/analysis`, analysisRouter)
  app.use(`${config.apiPrefix}/export`, exportRouter)
  app.use(`${config.apiPrefix}/contact`, contactRouter)

  // API root endpoint
  app.get(config.apiPrefix, (_req, res) => {
    res.json({
      message: 'RiseRoutes AI Ads Intelligence Platform API',
      version: '1.0.0',
      status: 'running',
    })
  })

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found',
    })
  })

  // Error handling middleware (must be last)
  app.use(errorHandler)

  return app
}
