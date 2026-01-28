/**
 * Data Sanitization Utilities
 * Provides sanitization functions to clean and normalize data before storage
 */

// ============================================================================
// HTML/XSS Sanitization
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  return text.replace(/[&<>"'/]/g, char => htmlEscapeMap[char])
}

/**
 * Strip HTML tags from text
 */
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize text by stripping HTML and escaping special characters
 */
export function sanitizeText(text: string): string {
  return escapeHtml(stripHtmlTags(text))
}

// ============================================================================
// SQL Injection Prevention
// ============================================================================

/**
 * Escape SQL special characters
 * Note: This is a backup. Always use parameterized queries!
 */
export function escapeSql(value: string): string {
  return value.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
    switch (char) {
      case '\0':
        return '\\0'
      case '\x08':
        return '\\b'
      case '\x09':
        return '\\t'
      case '\x1a':
        return '\\z'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char
      default:
        return char
    }
  })
}

// ============================================================================
// String Sanitization
// ============================================================================

/**
 * Trim and normalize whitespace
 */
export function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/**
 * Remove non-printable characters
 */
export function removeNonPrintable(text: string): string {
  return text.replace(/[^\x20-\x7E\n\r\t]/g, '')
}

/**
 * Sanitize string for safe storage
 */
export function sanitizeString(text: string): string {
  return normalizeWhitespace(removeNonPrintable(text))
}

/**
 * Truncate string to maximum length
 */
export function truncateString(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - 3) + '...'
}

// ============================================================================
// URL Sanitization
// ============================================================================

/**
 * Sanitize URL by removing dangerous protocols
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = trimmed.toLowerCase()

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return ''
    }
  }

  try {
    const urlObj = new URL(trimmed)
    // Only allow http and https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return ''
    }
    return urlObj.href
  } catch {
    return ''
  }
}

/**
 * Normalize URL by removing trailing slashes and fragments
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove trailing slash
    urlObj.pathname = urlObj.pathname.replace(/\/$/, '')
    // Remove fragment
    urlObj.hash = ''
    return urlObj.href
  } catch {
    return url
  }
}

// ============================================================================
// Email Sanitization
// ============================================================================

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Normalize email by removing dots in Gmail addresses
 */
export function normalizeEmail(email: string): string {
  const sanitized = sanitizeEmail(email)
  const [localPart, domain] = sanitized.split('@')

  if (!domain) {
    return sanitized
  }

  // For Gmail, remove dots from local part
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const normalizedLocal = localPart.replace(/\./g, '')
    return `${normalizedLocal}@${domain}`
  }

  return sanitized
}

// ============================================================================
// Number Sanitization
// ============================================================================

/**
 * Sanitize number input
 */
export function sanitizeNumber(value: any): number | null {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  return null
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(value: any): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? null : parsed
  }

  return null
}

/**
 * Clamp number to range
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ============================================================================
// Boolean Sanitization
// ============================================================================

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  return false
}

// ============================================================================
// Array Sanitization
// ============================================================================

/**
 * Sanitize array by removing null/undefined values
 */
export function sanitizeArray<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item): item is T => item !== null && item !== undefined)
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(array: string[]): string[] {
  return array
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0)
}

/**
 * Remove duplicate values from array
 */
export function deduplicateArray<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Sanitize and deduplicate string array
 */
export function sanitizeAndDeduplicateStringArray(array: string[]): string[] {
  return deduplicateArray(sanitizeStringArray(array))
}

// ============================================================================
// Object Sanitization
// ============================================================================

/**
 * Remove null and undefined values from object
 */
export function removeNullValues<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const result: Partial<T> = {}

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }

  return result
}

/**
 * Deep clone object (simple version)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Sanitize object keys (remove special characters)
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    // Remove special characters from keys, keep only alphanumeric and underscore
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_')
    result[sanitizedKey] = obj[key]
  }

  return result
}

// ============================================================================
// JSON Sanitization
// ============================================================================

/**
 * Sanitize JSON by parsing and re-stringifying
 */
export function sanitizeJson(value: any): any {
  try {
    // Parse and stringify to remove any functions or circular references
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

/**
 * Sanitize JSON string
 */
export function sanitizeJsonString(jsonString: string): string | null {
  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed)
  } catch {
    return null
  }
}

// ============================================================================
// Date Sanitization
// ============================================================================

/**
 * Sanitize date input
 */
export function sanitizeDate(value: any): Date | null {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

/**
 * Sanitize date to ISO string
 */
export function sanitizeDateToIso(value: any): string | null {
  const date = sanitizeDate(value)
  return date ? date.toISOString() : null
}

// ============================================================================
// Phone Number Sanitization
// ============================================================================

/**
 * Sanitize phone number by removing non-numeric characters
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, '')
}

/**
 * Format phone number to E.164 format (basic)
 */
export function formatPhoneNumber(phone: string): string {
  const sanitized = sanitizePhoneNumber(phone)

  // If it doesn't start with +, assume it's a US number
  if (!sanitized.startsWith('+')) {
    return `+1${sanitized}`
  }

  return sanitized
}

// ============================================================================
// File Name Sanitization
// ============================================================================

/**
 * Sanitize file name by removing dangerous characters
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and other dangerous characters
  return fileName
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim()
}

/**
 * Sanitize file extension
 */
export function sanitizeFileExtension(extension: string): string {
  return extension.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// ============================================================================
// Credit Card Sanitization (for display only)
// ============================================================================

/**
 * Mask credit card number for display
 */
export function maskCreditCard(cardNumber: string): string {
  const sanitized = cardNumber.replace(/\s/g, '')
  if (sanitized.length < 4) {
    return '****'
  }
  const lastFour = sanitized.slice(-4)
  return `**** **** **** ${lastFour}`
}

// ============================================================================
// Password Sanitization
// ============================================================================

/**
 * Sanitize password (trim only, don't modify content)
 */
export function sanitizePassword(password: string): string {
  // Only trim, don't modify the actual password content
  return password.trim()
}

// ============================================================================
// Slug Sanitization
// ============================================================================

/**
 * Create URL-safe slug from text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================================================
// Color Code Sanitization
// ============================================================================

/**
 * Sanitize hex color code
 */
export function sanitizeHexColor(color: string): string | null {
  const sanitized = color.trim().toLowerCase()

  // Check if it's a valid hex color
  const hexRegex = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/
  if (!hexRegex.test(sanitized)) {
    return null
  }

  // Add # if missing
  return sanitized.startsWith('#') ? sanitized : `#${sanitized}`
}

// ============================================================================
// Coordinate Sanitization
// ============================================================================

/**
 * Sanitize latitude
 */
export function sanitizeLatitude(lat: number): number | null {
  const sanitized = sanitizeNumber(lat)
  if (sanitized === null) {
    return null
  }
  return clampNumber(sanitized, -90, 90)
}

/**
 * Sanitize longitude
 */
export function sanitizeLongitude(lng: number): number | null {
  const sanitized = sanitizeNumber(lng)
  if (sanitized === null) {
    return null
  }
  return clampNumber(sanitized, -180, 180)
}

// ============================================================================
// Composite Sanitization Functions
// ============================================================================

/**
 * Sanitize user input object
 */
export function sanitizeUserInput(input: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const key in input) {
    const value = input[key]

    if (value === null || value === undefined) {
      continue
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'number') {
      sanitized[key] = value
    } else if (typeof value === 'boolean') {
      sanitized[key] = value
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      )
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeUserInput(value)
    }
  }

  return sanitized
}
