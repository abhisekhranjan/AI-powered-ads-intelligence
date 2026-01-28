import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserModel } from './User.js'
import bcrypt from 'bcrypt'

// Mock the database pool
vi.mock('../config/database.js', () => ({
  pool: {
    execute: vi.fn(),
  },
}))

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-123'),
}))

import { pool } from '../config/database.js'

describe('UserModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      const password = 'testpassword123'
      const hashedPassword = 'hashed-password'

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never)

      const result = await UserModel.hashPassword(password)

      expect(result).toBe(hashedPassword)
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testpassword123'
      const hash = 'hashed-password'

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const result = await UserModel.comparePassword(password, hash)

      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash)
    })

    it('should return false for non-matching password', async () => {
      const password = 'wrongpassword'
      const hash = 'hashed-password'

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const result = await UserModel.comparePassword(password, hash)

      expect(result).toBe(false)
    })
  })

  describe('create', () => {
    it('should create a new user with all fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Corp',
        subscription_tier: 'pro' as const,
      }

      const mockUser = {
        id: 'mock-uuid-123',
        email: userData.email,
        password_hash: 'hashed-password',
        first_name: userData.first_name,
        last_name: userData.last_name,
        company: userData.company,
        subscription_tier: userData.subscription_tier,
        created_at: new Date(),
        last_login: null,
      }

      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(pool.execute)
        .mockResolvedValueOnce([{ affectedRows: 1 }] as never) // INSERT
        .mockResolvedValueOnce([[mockUser]] as never) // SELECT

      const result = await UserModel.create(userData)

      expect(result).toEqual(mockUser)
      expect(pool.execute).toHaveBeenCalledTimes(2)
    })

    it('should create user with default subscription tier', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockUser = {
        id: 'mock-uuid-123',
        email: userData.email,
        password_hash: 'hashed-password',
        first_name: null,
        last_name: null,
        company: null,
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(pool.execute)
        .mockResolvedValueOnce([{ affectedRows: 1 }] as never)
        .mockResolvedValueOnce([[mockUser]] as never)

      const result = await UserModel.create(userData)

      expect(result.subscription_tier).toBe('free')
    })
  })

  describe('findById', () => {
    it('should return user when found', async () => {
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

      vi.mocked(pool.execute).mockResolvedValue([[mockUser]] as never)

      const result = await UserModel.findById(userId)

      expect(result).toEqual(mockUser)
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      )
    })

    it('should return null when user not found', async () => {
      vi.mocked(pool.execute).mockResolvedValue([[]] as never)

      const result = await UserModel.findById('nonexistent-id')

      expect(result).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const email = 'test@example.com'
      const mockUser = {
        id: 'user-123',
        email,
        password_hash: 'hashed-password',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      vi.mocked(pool.execute).mockResolvedValue([[mockUser]] as never)

      const result = await UserModel.findByEmail(email)

      expect(result).toEqual(mockUser)
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        [email]
      )
    })

    it('should return null when user not found', async () => {
      vi.mocked(pool.execute).mockResolvedValue([[]] as never)

      const result = await UserModel.findByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('toResponse', () => {
    it('should remove password_hash from user object', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Corp',
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      const result = UserModel.toResponse(user)

      expect(result).not.toHaveProperty('password_hash')
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        company: user.company,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at,
        last_login: user.last_login,
      })
    })
  })

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'existing@example.com',
        password_hash: 'hashed-password',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        subscription_tier: 'free' as const,
        created_at: new Date(),
        last_login: null,
      }

      vi.mocked(pool.execute).mockResolvedValue([[mockUser]] as never)

      const result = await UserModel.emailExists('existing@example.com')

      expect(result).toBe(true)
    })

    it('should return false when email does not exist', async () => {
      vi.mocked(pool.execute).mockResolvedValue([[]] as never)

      const result = await UserModel.emailExists('nonexistent@example.com')

      expect(result).toBe(false)
    })
  })

  describe('updateLastLogin', () => {
    it('should update last_login timestamp', async () => {
      const userId = 'user-123'

      vi.mocked(pool.execute).mockResolvedValue([{ affectedRows: 1 }] as never)

      await UserModel.updateLastLogin(userId)

      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      )
    })
  })
})
