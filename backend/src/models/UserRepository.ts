/**
 * User Repository - Database access layer for users table
 */

import { RowDataPacket } from 'mysql2/promise'
import { BaseRepository } from './BaseRepository.js'
import { User, CreateUserInput, UpdateUserInput, ValidationError } from './types.js'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users')
  }

  /**
   * Map database row to User model
   */
  protected mapRowToModel(row: RowDataPacket): User {
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      first_name: row.first_name,
      last_name: row.last_name,
      company: row.company,
      subscription_tier: row.subscription_tier,
      created_at: row.created_at,
      last_login: row.last_login
    }
  }

  /**
   * Create a new user with hashed password
   */
  async createUser(input: CreateUserInput): Promise<User> {
    // Validate email format
    if (!this.isValidEmail(input.email)) {
      throw new ValidationError('Invalid email format', 'email', input.email)
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(input.email)
    if (existingUser) {
      throw new ValidationError('Email already exists', 'email', input.email)
    }

    // Hash password
    const password_hash = await bcrypt.hash(input.password, 10)

    // Create user data
    const userData: Partial<User> = {
      id: uuidv4(),
      email: input.email.toLowerCase().trim(),
      password_hash,
      first_name: input.first_name || null,
      last_name: input.last_name || null,
      company: input.company || null,
      subscription_tier: input.subscription_tier || 'free',
      created_at: new Date(),
      last_login: null
    }

    const userId = await this.create(userData)
    const user = await this.findById(userId)
    
    if (!user) {
      throw new Error('Failed to retrieve created user')
    }

    return user
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOneBy('email', email.toLowerCase().trim())
  }

  /**
   * Update user information
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
    const updateData: Partial<User> = {}

    if (input.first_name !== undefined) {
      updateData.first_name = input.first_name
    }
    if (input.last_name !== undefined) {
      updateData.last_name = input.last_name
    }
    if (input.company !== undefined) {
      updateData.company = input.company
    }
    if (input.subscription_tier !== undefined) {
      updateData.subscription_tier = input.subscription_tier
    }
    if (input.last_login !== undefined) {
      updateData.last_login = input.last_login
    }

    const updated = await this.update(id, updateData)
    
    if (!updated) {
      return null
    }

    return this.findById(id)
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string): Promise<boolean> {
    return this.update(id, { last_login: new Date() } as Partial<User>)
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    
    if (!user) {
      return null
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isValid) {
      return null
    }

    return user
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, 10)
    return this.update(id, { password_hash } as Partial<User>)
  }

  /**
   * Find users by subscription tier
   */
  async findBySubscriptionTier(tier: string): Promise<User[]> {
    return this.findBy('subscription_tier', tier)
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Export singleton instance
export const userRepository = new UserRepository()
