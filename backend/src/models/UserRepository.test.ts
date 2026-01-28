/**
 * Unit tests for UserRepository
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { userRepository } from './UserRepository.js'
import { pool } from '../config/database.js'
import { ValidationError } from './types.js'

describe('UserRepository', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['test%@example.com'])
  })

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const input = {
        email: 'test1@example.com',
        password: 'SecurePassword123!',
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Corp'
      }

      const user = await userRepository.createUser(input)

      expect(user).toBeDefined()
      expect(user.email).toBe(input.email)
      expect(user.first_name).toBe(input.first_name)
      expect(user.last_name).toBe(input.last_name)
      expect(user.company).toBe(input.company)
      expect(user.subscription_tier).toBe('free')
      expect(user.password_hash).not.toBe(input.password) // Password should be hashed
      expect(user.id).toBeDefined()
    })

    it('should create user with minimal data', async () => {
      const input = {
        email: 'test2@example.com',
        password: 'password123'
      }

      const user = await userRepository.createUser(input)

      expect(user).toBeDefined()
      expect(user.email).toBe(input.email)
      expect(user.first_name).toBeNull()
      expect(user.last_name).toBeNull()
      expect(user.company).toBeNull()
      expect(user.subscription_tier).toBe('free')
    })

    it('should throw ValidationError for invalid email', async () => {
      const input = {
        email: 'invalid-email',
        password: 'password123'
      }

      await expect(userRepository.createUser(input)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for duplicate email', async () => {
      const input = {
        email: 'test3@example.com',
        password: 'password123'
      }

      await userRepository.createUser(input)
      
      // Try to create another user with same email
      await expect(userRepository.createUser(input)).rejects.toThrow(ValidationError)
    })

    it('should normalize email to lowercase', async () => {
      const input = {
        email: 'TEST4@EXAMPLE.COM',
        password: 'password123'
      }

      const user = await userRepository.createUser(input)

      expect(user.email).toBe('test4@example.com')
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const input = {
        email: 'test5@example.com',
        password: 'password123'
      }

      await userRepository.createUser(input)
      const user = await userRepository.findByEmail(input.email)

      expect(user).toBeDefined()
      expect(user?.email).toBe(input.email)
    })

    it('should return null for non-existent email', async () => {
      const user = await userRepository.findByEmail('nonexistent@example.com')
      expect(user).toBeNull()
    })

    it('should find user with case-insensitive email', async () => {
      const input = {
        email: 'test6@example.com',
        password: 'password123'
      }

      await userRepository.createUser(input)
      const user = await userRepository.findByEmail('TEST6@EXAMPLE.COM')

      expect(user).toBeDefined()
      expect(user?.email).toBe(input.email)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const input = {
        email: 'test7@example.com',
        password: 'SecurePassword123!'
      }

      await userRepository.createUser(input)
      const user = await userRepository.verifyPassword(input.email, input.password)

      expect(user).toBeDefined()
      expect(user?.email).toBe(input.email)
    })

    it('should return null for incorrect password', async () => {
      const input = {
        email: 'test8@example.com',
        password: 'SecurePassword123!'
      }

      await userRepository.createUser(input)
      const user = await userRepository.verifyPassword(input.email, 'WrongPassword')

      expect(user).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      const user = await userRepository.verifyPassword('nonexistent@example.com', 'password')
      expect(user).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user information', async () => {
      const input = {
        email: 'test9@example.com',
        password: 'password123'
      }

      const user = await userRepository.createUser(input)
      const updated = await userRepository.updateUser(user.id, {
        first_name: 'Jane',
        last_name: 'Smith',
        company: 'New Corp',
        subscription_tier: 'pro'
      })

      expect(updated).toBeDefined()
      expect(updated?.first_name).toBe('Jane')
      expect(updated?.last_name).toBe('Smith')
      expect(updated?.company).toBe('New Corp')
      expect(updated?.subscription_tier).toBe('pro')
    })

    it('should return null for non-existent user', async () => {
      const updated = await userRepository.updateUser('non-existent-id', {
        first_name: 'Test'
      })

      expect(updated).toBeNull()
    })
  })

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const input = {
        email: 'test10@example.com',
        password: 'OldPassword123!'
      }

      const user = await userRepository.createUser(input)
      const newPassword = 'NewPassword456!'
      
      await userRepository.updatePassword(user.id, newPassword)
      
      // Verify old password doesn't work
      const oldPasswordCheck = await userRepository.verifyPassword(input.email, input.password)
      expect(oldPasswordCheck).toBeNull()
      
      // Verify new password works
      const newPasswordCheck = await userRepository.verifyPassword(input.email, newPassword)
      expect(newPasswordCheck).toBeDefined()
    })
  })

  describe('findBySubscriptionTier', () => {
    it('should find users by subscription tier', async () => {
      await userRepository.createUser({
        email: 'test11@example.com',
        password: 'password123',
        subscription_tier: 'pro'
      })

      await userRepository.createUser({
        email: 'test12@example.com',
        password: 'password123',
        subscription_tier: 'pro'
      })

      const proUsers = await userRepository.findBySubscriptionTier('pro')
      
      expect(proUsers.length).toBeGreaterThanOrEqual(2)
      expect(proUsers.every(u => u.subscription_tier === 'pro')).toBe(true)
    })
  })

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const input = {
        email: 'test13@example.com',
        password: 'password123'
      }

      const user = await userRepository.createUser(input)
      expect(user.last_login).toBeNull()

      await userRepository.updateLastLogin(user.id)
      
      const updated = await userRepository.findById(user.id)
      expect(updated?.last_login).toBeDefined()
      expect(updated?.last_login).toBeInstanceOf(Date)
    })
  })
})
