import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AuthService } from '../services/authService.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

// Registration request schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company: z.string().optional(),
})

// Login request schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// POST /auth/register - Register a new user
router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body)

      // Register user
      const result = await AuthService.register(validatedData)

      // Send response
      res.status(201).json({
        status: 'success',
        data: {
          user: result.user,
          token: result.token,
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, error.errors[0].message))
      } else {
        next(error)
      }
    }
  }
)

// POST /auth/login - Login user
router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body)

      // Login user
      const result = await AuthService.login(validatedData)

      // Send response
      res.status(200).json({
        status: 'success',
        data: {
          user: result.user,
          token: result.token,
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, error.errors[0].message))
      } else {
        next(error)
      }
    }
  }
)

// GET /auth/me - Get current user (requires authentication)
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new AppError(401, 'Unauthorized')
      }

      // Get user by ID
      const user = await AuthService.getUserById(req.userId)

      // Send response
      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router
