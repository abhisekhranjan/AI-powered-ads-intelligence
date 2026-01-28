import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express, { Application } from 'express'
import authRouter from './auth.js'
import { AuthService } from '../services/authService.js'
import { errorHandler } from '../middleware/errorHandler.js'

// Mock the AuthService
vi.mock('../services/authService.js', () => ({
  AuthService: {
    register: vi.fn(),
    login: vi.fn(),
    getUserById: vi.fn(),
  },
}))

// Mock the auth middleware
vi.mock('../middleware/auth.js', () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.userId = 'user-123'
    next()
  }),
  generateToken: vi.fn(() => 'mock-jwt-token'),
}))

describe('Auth Routes', () => {
  let app: Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    app.use('/auth', authRouter)
    app.use(errorHandler)
  })

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      }

      const mockResponse = {
        user: {
          id: 'user-123',
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          company: null,
          subscription_tier: 'free',
          created_at: new Date(),
          last_login: null,
        },
        token: 'mock-jwt-token',
      }

      vi.mocked(AuthService.register).mockResolvedValue(mockResponse)

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toEqual({
        status: 'success',
        data: mockResponse,
      })
      expect(AuthService.register).toHaveBeenCalledWith(userData)
    })

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
      }

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(AuthService.register).not.toHaveBeenCalled()
    })

    it('should reject registration with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'short',
      }

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(AuthService.register).not.toHaveBeenCalled()
    })

    it('should reject registration with missing email', async () => {
      const userData = {
        password: 'password123',
      }

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(AuthService.register).not.toHaveBeenCalled()
    })
  })

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        user: {
          id: 'user-123',
          email: credentials.email,
          first_name: 'John',
          last_name: 'Doe',
          company: null,
          subscription_tier: 'free',
          created_at: new Date(),
          last_login: new Date(),
        },
        token: 'mock-jwt-token',
      }

      vi.mocked(AuthService.login).mockResolvedValue(mockResponse)

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        data: mockResponse,
      })
      expect(AuthService.login).toHaveBeenCalledWith(credentials)
    })

    it('should reject login with invalid email format', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123',
      }

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(AuthService.login).not.toHaveBeenCalled()
    })

    it('should reject login with missing password', async () => {
      const credentials = {
        email: 'test@example.com',
      }

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(AuthService.login).not.toHaveBeenCalled()
    })
  })

  describe('GET /auth/me', () => {
    it('should return current user data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        subscription_tier: 'free',
        created_at: new Date(),
        last_login: new Date(),
      }

      vi.mocked(AuthService.getUserById).mockResolvedValue(mockUser)

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer mock-token')
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        data: {
          user: mockUser,
        },
      })
      expect(AuthService.getUserById).toHaveBeenCalledWith('user-123')
    })
  })
})
