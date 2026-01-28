import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from './authService.js'
import { UserModel } from '../models/User.js'
import { AppError } from '../middleware/errorHandler.js'

// Mock the UserModel
vi.mock('../models/User.js', () => ({
  UserModel: {
    emailExists: vi.fn(),
    create: vi.fn(),
    findByEmail: vi.fn(),
    comparePassword: vi.fn(),
    updateLastLogin: vi.fn(),
    toResponse: vi.fn(),
  },
}))

// Mock the auth middleware
vi.mock('../middleware/auth.js', () => ({
  generateToken: vi.fn(() => 'mock-jwt-token'),
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      }

      const mockUser = {
        id: 'user-123',
        email: userData.email,
        password_hash: 'hashed-password',
        first_name: userData.first_name,
        last_name: userData.last_name,
        company: null,
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      const mockUserResponse = {
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        company: mockUser.company,
        subscription_tier: mockUser.subscription_tier,
        created_at: mockUser.created_at,
        last_login: mockUser.last_login,
      }

      vi.mocked(UserModel.emailExists).mockResolvedValue(false)
      vi.mocked(UserModel.create).mockResolvedValue(mockUser)
      vi.mocked(UserModel.toResponse).mockReturnValue(mockUserResponse)

      const result = await AuthService.register(userData)

      expect(result).toEqual({
        user: mockUserResponse,
        token: 'mock-jwt-token',
      })
      expect(UserModel.emailExists).toHaveBeenCalledWith(userData.email)
      expect(UserModel.create).toHaveBeenCalledWith(userData)
    })

    it('should reject registration with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
      }

      await expect(AuthService.register(userData)).rejects.toThrow(
        new AppError(400, 'Invalid email format')
      )
    })

    it('should reject registration with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'short',
      }

      await expect(AuthService.register(userData)).rejects.toThrow(
        new AppError(400, 'Password must be at least 8 characters long')
      )
    })

    it('should reject registration with existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      }

      vi.mocked(UserModel.emailExists).mockResolvedValue(true)

      await expect(AuthService.register(userData)).rejects.toThrow(
        new AppError(409, 'Email already registered')
      )
    })
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockUser = {
        id: 'user-123',
        email: credentials.email,
        password_hash: 'hashed-password',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      const mockUserResponse = {
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        company: mockUser.company,
        subscription_tier: mockUser.subscription_tier,
        created_at: mockUser.created_at,
        last_login: mockUser.last_login,
      }

      vi.mocked(UserModel.findByEmail).mockResolvedValue(mockUser)
      vi.mocked(UserModel.comparePassword).mockResolvedValue(true)
      vi.mocked(UserModel.updateLastLogin).mockResolvedValue(undefined)
      vi.mocked(UserModel.toResponse).mockReturnValue(mockUserResponse)

      const result = await AuthService.login(credentials)

      expect(result).toEqual({
        user: mockUserResponse,
        token: 'mock-jwt-token',
      })
      expect(UserModel.findByEmail).toHaveBeenCalledWith(credentials.email)
      expect(UserModel.comparePassword).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password_hash
      )
      expect(UserModel.updateLastLogin).toHaveBeenCalledWith(mockUser.id)
    })

    it('should reject login with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      vi.mocked(UserModel.findByEmail).mockResolvedValue(null)

      await expect(AuthService.login(credentials)).rejects.toThrow(
        new AppError(401, 'Invalid email or password')
      )
    })

    it('should reject login with incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const mockUser = {
        id: 'user-123',
        email: credentials.email,
        password_hash: 'hashed-password',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      vi.mocked(UserModel.findByEmail).mockResolvedValue(mockUser)
      vi.mocked(UserModel.comparePassword).mockResolvedValue(false)

      await expect(AuthService.login(credentials)).rejects.toThrow(
        new AppError(401, 'Invalid email or password')
      )
    })
  })

  describe('getUserById', () => {
    it('should return user data for valid user ID', async () => {
      const userId = 'user-123'
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      const mockUserResponse = {
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        company: mockUser.company,
        subscription_tier: mockUser.subscription_tier,
        created_at: mockUser.created_at,
        last_login: mockUser.last_login,
      }

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser)
      vi.mocked(UserModel.toResponse).mockReturnValue(mockUserResponse)

      const result = await AuthService.getUserById(userId)

      expect(result).toEqual(mockUserResponse)
    })

    it('should throw error for non-existent user ID', async () => {
      const userId = 'nonexistent-id'

      vi.mocked(UserModel.findById).mockResolvedValue(null)

      await expect(AuthService.getUserById(userId)).rejects.toThrow(
        new AppError(404, 'User not found')
      )
    })
  })
})
