import { createClient } from 'redis'
import { config } from './env.js'

// Create Redis client
export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password || undefined,
})

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('✓ Redis connection established successfully')
})

// Connect to Redis
export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error('✗ Redis connection failed:', error)
    throw error
  }
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  await redisClient.quit()
  console.log('Redis connection closed')
}

// Cache utilities
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key)
    return value ? JSON.parse(value) : null
  },

  async set(key: string, value: any, expiresInSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (expiresInSeconds) {
      await redisClient.setEx(key, expiresInSeconds, serialized)
    } else {
      await redisClient.set(key, serialized)
    }
  },

  async del(key: string): Promise<void> {
    await redisClient.del(key)
  },

  async exists(key: string): Promise<boolean> {
    const result = await redisClient.exists(key)
    return result === 1
  },
}
