import { createApp } from './app.js'
import { config } from './config/env.js'
import { logger } from './config/logger.js'
import { testConnection, closePool } from './config/database.js'
import { connectRedis, closeRedis } from './config/redis.js'

// Create Express app
const app = createApp()

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection()
    if (!dbConnected) {
      logger.error('Failed to connect to database')
      process.exit(1)
    }

    // Connect to Redis
    await connectRedis()

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`)
      logger.info(`📝 Environment: ${config.env}`)
      logger.info(`🔗 API: http://localhost:${config.port}${config.apiPrefix}`)
    })

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`)

      server.close(async () => {
        logger.info('HTTP server closed')

        try {
          await closePool()
          await closeRedis()
          logger.info('All connections closed')
          process.exit(0)
        } catch (error) {
          logger.error('Error during shutdown:', error)
          process.exit(1)
        }
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
