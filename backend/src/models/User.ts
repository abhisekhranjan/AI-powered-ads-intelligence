import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import { pool } from '../config/database.js'

// User subscription tiers
export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

// User interface
export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  company: string | null
  subscription_tier: SubscriptionTier
  created_at: Date
  last_login: Date | null
}

// User creation data (without password_hash)
export interface CreateUserData {
  email: string
  password: string
  first_name?: string
  last_name?: string
  company?: string
  subscription_tier?: SubscriptionTier
}

// User response (without password_hash)
export interface UserResponse {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company: string | null
  subscription_tier: SubscriptionTier
  created_at: Date
  last_login: Date | null
}

// User database row
interface UserRow extends RowDataPacket {
  id: string
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  company: string | null
  subscription_tier: SubscriptionTier
  created_at: Date
  last_login: Date | null
}

// User model class
export class UserModel {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  // Compare password with hash
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // Create a new user
  static async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4()
    const password_hash = await this.hashPassword(userData.password)

    const query = `
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, company, subscription_tier
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      id,
      userData.email,
      password_hash,
      userData.first_name || null,
      userData.last_name || null,
      userData.company || null,
      userData.subscription_tier || 'free',
    ]

    await pool.execute<ResultSetHeader>(query, values)

    // Fetch and return the created user
    const user = await this.findById(id)
    if (!user) {
      throw new Error('Failed to create user')
    }

    return user
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = ?'
    const [rows] = await pool.execute<UserRow[]>(query, [id])

    if (rows.length === 0) {
      return null
    }

    return rows[0]
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = ?'
    const [rows] = await pool.execute<UserRow[]>(query, [email])

    if (rows.length === 0) {
      return null
    }

    return rows[0]
  }

  // Update last login timestamp
  static async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    await pool.execute<ResultSetHeader>(query, [id])
  }

  // Convert User to UserResponse (remove password_hash)
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      company: user.company,
      subscription_tier: user.subscription_tier,
      created_at: user.created_at,
      last_login: user.last_login,
    }
  }

  // Check if email exists
  static async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email)
    return user !== null
  }
}
