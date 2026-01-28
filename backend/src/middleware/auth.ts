import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { AppError } from './errorHandler.js'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

// JWT payload interface
interface JWTPayload {
  userId: string
  email: string
}

// Authentication middleware
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided')
    }

    const token = authHeader.substring(7)

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload

    // Attach user ID to request
    req.userId = decoded.userId

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expired'))
    } else {
      next(error)
    }
  }
}

// Generate JWT token
export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string,
  } as jwt.SignOptions)
}
