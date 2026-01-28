import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { AppError } from './errorHandler.js'

// Validation middleware factory
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }))
        next(new AppError(400, JSON.stringify(messages)))
      } else {
        next(error)
      }
    }
  }
}
