import rateLimit from 'express-rate-limit'
import { config } from '../config/env.js'

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Analysis rate limiter (more restrictive for resource-intensive operations)
export const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 analyses per hour
  message: 'Analysis limit reached. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
