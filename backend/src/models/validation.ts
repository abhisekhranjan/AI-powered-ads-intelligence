/**
 * Data Validation and Sanitization Utilities
 * Provides validation functions for all data models
 */

import { ValidationError } from './types.js'

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Validate URL format
 */
export function validateUrl(url: string, fieldName: string = 'url'): void {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL is required', fieldName, url)
  }

  try {
    const urlObj = new URL(url)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new ValidationError(
        'URL must use HTTP or HTTPS protocol',
        fieldName,
        url
      )
    }
  } catch (error) {
    throw new ValidationError('Invalid URL format', fieldName, url)
  }
}

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string, fieldName: string = 'email'): void {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required', fieldName, email)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', fieldName, email)
  }
}

// ============================================================================
// String Validation
// ============================================================================

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): void {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName, value)
  }

  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      fieldName,
      value
    )
  }

  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters`,
      fieldName,
      value
    )
  }
}

// ============================================================================
// UUID Validation
// ============================================================================

/**
 * Validate UUID format
 */
export function validateUuid(uuid: string, fieldName: string = 'id'): void {
  if (!uuid || typeof uuid !== 'string') {
    throw new ValidationError('UUID is required', fieldName, uuid)
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new ValidationError('Invalid UUID format', fieldName, uuid)
  }
}

// ============================================================================
// Enum Validation
// ============================================================================

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: T,
  allowedValues: readonly T[],
  fieldName: string
): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      fieldName,
      value
    )
  }
}

// ============================================================================
// Number Validation
// ============================================================================

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName, value)
  }

  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      fieldName,
      value
    )
  }
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(
  value: number,
  fieldName: string
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName, value)
  }

  if (value <= 0) {
    throw new ValidationError(
      `${fieldName} must be a positive number`,
      fieldName,
      value
    )
  }
}

// ============================================================================
// Array Validation
// ============================================================================

/**
 * Validate array length
 */
export function validateArrayLength<T>(
  array: T[],
  minLength: number,
  maxLength: number,
  fieldName: string
): void {
  if (!Array.isArray(array)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName, array)
  }

  if (array.length < minLength) {
    throw new ValidationError(
      `${fieldName} must contain at least ${minLength} items`,
      fieldName,
      array
    )
  }

  if (array.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must contain at most ${maxLength} items`,
      fieldName,
      array
    )
  }
}

/**
 * Validate array of URLs
 */
export function validateUrlArray(
  urls: string[],
  fieldName: string = 'urls'
): void {
  if (!Array.isArray(urls)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName, urls)
  }

  urls.forEach((url, index) => {
    try {
      validateUrl(url, `${fieldName}[${index}]`)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new ValidationError(
        `Invalid URL at index ${index}`,
        fieldName,
        url
      )
    }
  })
}

// ============================================================================
// Date Validation
// ============================================================================

/**
 * Validate date
 */
export function validateDate(date: Date, fieldName: string): void {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new ValidationError('Invalid date', fieldName, date)
  }
}

/**
 * Validate date is in the past
 */
export function validatePastDate(date: Date, fieldName: string): void {
  validateDate(date, fieldName)

  if (date > new Date()) {
    throw new ValidationError(
      `${fieldName} must be in the past`,
      fieldName,
      date
    )
  }
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(date: Date, fieldName: string): void {
  validateDate(date, fieldName)

  if (date < new Date()) {
    throw new ValidationError(
      `${fieldName} must be in the future`,
      fieldName,
      date
    )
  }
}

// ============================================================================
// JSON Validation
// ============================================================================

/**
 * Validate location string format
 */
export function validateLocation(
  location: string,
  fieldName: string = 'location'
): void {
  if (!location || typeof location !== 'string') {
    throw new ValidationError('Location is required', fieldName, location)
  }

  validateStringLength(location, 2, 100, fieldName)
}

// ============================================================================
// JSON Validation
// ============================================================================

/**
 * Validate JSON string
 */
export function validateJsonString(
  jsonString: string,
  fieldName: string
): void {
  try {
    JSON.parse(jsonString)
  } catch (error) {
    throw new ValidationError('Invalid JSON format', fieldName, jsonString)
  }
}

// ============================================================================
// Object Validation
// ============================================================================

/**
 * Validate required fields in object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[],
  objectName: string = 'object'
): void {
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null) {
      throw new ValidationError(
        `${String(field)} is required in ${objectName}`,
        String(field),
        obj[field]
      )
    }
  }
}

/**
 * Validate object has at least one of the specified fields
 */
export function validateAtLeastOneField<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  objectName: string = 'object'
): void {
  const hasAtLeastOne = fields.some(
    field => obj[field] !== undefined && obj[field] !== null
  )

  if (!hasAtLeastOne) {
    throw new ValidationError(
      `${objectName} must have at least one of: ${fields.map(String).join(', ')}`,
      'fields',
      obj
    )
  }
}

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  fieldName: string = 'password'
): void {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required', fieldName, password)
  }

  if (password.length < 8) {
    throw new ValidationError(
      'Password must be at least 8 characters',
      fieldName,
      password
    )
  }

  if (password.length > 128) {
    throw new ValidationError(
      'Password must be at most 128 characters',
      fieldName,
      password
    )
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError(
      'Password must contain at least one uppercase letter',
      fieldName,
      password
    )
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    throw new ValidationError(
      'Password must contain at least one lowercase letter',
      fieldName,
      password
    )
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    throw new ValidationError(
      'Password must contain at least one number',
      fieldName,
      password
    )
  }
}

// ============================================================================
// Confidence Score Validation
// ============================================================================

/**
 * Validate confidence score (0-1 range)
 */
export function validateConfidenceScore(
  score: number,
  fieldName: string = 'confidence_score'
): void {
  validateNumberRange(score, 0, 1, fieldName)
}

// ============================================================================
// Business Model Validation
// ============================================================================

const VALID_BUSINESS_MODELS = [
  'ecommerce',
  'saas',
  'service',
  'marketplace',
  'subscription',
  'freemium',
  'advertising',
  'affiliate',
  'consulting',
  'agency',
  'other'
] as const

export type BusinessModelType = typeof VALID_BUSINESS_MODELS[number]

/**
 * Validate business model type
 */
export function validateBusinessModel(
  model: string,
  fieldName: string = 'business_model'
): void {
  if (!model || typeof model !== 'string') {
    throw new ValidationError('Business model is required', fieldName, model)
  }

  // Allow custom business models, but validate length
  validateStringLength(model, 2, 100, fieldName)
}

// ============================================================================
// Platform Validation
// ============================================================================

const VALID_PLATFORMS = ['meta', 'google'] as const
export type PlatformType = typeof VALID_PLATFORMS[number]

/**
 * Validate ad platform
 */
export function validatePlatform(
  platform: string,
  fieldName: string = 'platform'
): void {
  validateEnum(platform as PlatformType, VALID_PLATFORMS, fieldName)
}

// ============================================================================
// Export Type Validation
// ============================================================================

const VALID_EXPORT_TYPES = [
  'meta_csv',
  'google_csv',
  'client_report',
  'clipboard'
] as const
export type ExportTypeValue = typeof VALID_EXPORT_TYPES[number]

/**
 * Validate export type
 */
export function validateExportType(
  exportType: string,
  fieldName: string = 'export_type'
): void {
  validateEnum(exportType as ExportTypeValue, VALID_EXPORT_TYPES, fieldName)
}

// ============================================================================
// Status Validation
// ============================================================================

const VALID_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const
export type StatusType = typeof VALID_STATUSES[number]

/**
 * Validate analysis status
 */
export function validateStatus(
  status: string,
  fieldName: string = 'status'
): void {
  validateEnum(status as StatusType, VALID_STATUSES, fieldName)
}

// ============================================================================
// Subscription Tier Validation
// ============================================================================

const VALID_SUBSCRIPTION_TIERS = ['free', 'pro', 'enterprise'] as const
export type SubscriptionTierType = typeof VALID_SUBSCRIPTION_TIERS[number]

/**
 * Validate subscription tier
 */
export function validateSubscriptionTier(
  tier: string,
  fieldName: string = 'subscription_tier'
): void {
  validateEnum(tier as SubscriptionTierType, VALID_SUBSCRIPTION_TIERS, fieldName)
}
