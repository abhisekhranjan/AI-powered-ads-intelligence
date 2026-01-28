import { UserModel, CreateUserData, UserResponse } from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

// Registration response
export interface RegisterResponse {
  user: UserResponse
  token: string
}

// Login response
export interface LoginResponse {
  user: UserResponse
  token: string
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Authentication service
export class AuthService {
  // Register a new user
  static async register(userData: CreateUserData): Promise<RegisterResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      throw new AppError(400, 'Invalid email format')
    }

    // Validate password strength
    if (userData.password.length < 8) {
      throw new AppError(
        400,
        'Password must be at least 8 characters long'
      )
    }

    // Check if email already exists
    const emailExists = await UserModel.emailExists(userData.email)
    if (emailExists) {
      throw new AppError(409, 'Email already registered')
    }

    // Create user
    const user = await UserModel.create(userData)

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    // Return user response and token
    return {
      user: UserModel.toResponse(user),
      token,
    }
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Find user by email
    const user = await UserModel.findByEmail(credentials.email)
    if (!user) {
      throw new AppError(401, 'Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await UserModel.comparePassword(
      credentials.password,
      user.password_hash
    )
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password')
    }

    // Update last login timestamp
    await UserModel.updateLastLogin(user.id)

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    // Return user response and token
    return {
      user: UserModel.toResponse(user),
      token,
    }
  }

  // Get user by ID (for authenticated requests)
  static async getUserById(userId: string): Promise<UserResponse> {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return UserModel.toResponse(user)
  }
}
