import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'

// Custom error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Error handler middleware
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  })

  // Handle operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    })
  }

  // Handle programming or unknown errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  })
}

// Async handler wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
