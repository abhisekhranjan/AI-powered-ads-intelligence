# Models and Database Access Layer

This directory contains all TypeScript models, type definitions, and database access utilities for the RiseRoutes AI Ads Intelligence Platform.

## Overview

The models layer provides:
- **Type-safe data models** for all database entities
- **Repository pattern** for database operations
- **Validation utilities** for data integrity
- **Sanitization functions** for security
- **Query helpers** for common database patterns

## Directory Structure

```
models/
├── types.ts                          # TypeScript type definitions
├── validation.ts                     # Data validation utilities
├── sanitization.ts                   # Data sanitization utilities
├── queryHelpers.ts                   # Database query helpers
├── BaseRepository.ts                 # Base repository class
├── User.ts                           # User model (legacy)
├── UserRepository.ts                 # User repository
├── AnalysisSessionRepository.ts      # Analysis session repository
├── WebsiteAnalysisRepository.ts      # Website analysis repository
├── CompetitorAnalysisRepository.ts   # Competitor analysis repository
├── TargetingRecommendationRepository.ts  # Targeting recommendation repository
├── ExportHistoryRepository.ts        # Export history repository
├── AnalysisCacheRepository.ts        # Analysis cache repository
└── index.ts                          # Central export point
```

## Core Concepts

### 1. Type Definitions (`types.ts`)

All database entities and domain models are defined with TypeScript interfaces:

```typescript
import { User, AnalysisSession, WebsiteAnalysis } from './models'

// Type-safe data access
const user: User = await userRepository.findById(userId)
const session: AnalysisSession = await analysisSessionRepository.findById(sessionId)
```

### 2. Repository Pattern

Each database table has a corresponding repository class that extends `BaseRepository`:

```typescript
import { userRepository, analysisSessionRepository } from './models'

// Create a new user
const user = await userRepository.createUser({
  email: 'user@example.com',
  password: 'SecurePass123',
  first_name: 'John',
  last_name: 'Doe'
})

// Find analysis sessions
const sessions = await analysisSessionRepository.findByUserId(user.id)
```

### 3. Base Repository

The `BaseRepository` class provides common CRUD operations:

- `findById(id)` - Find a record by ID
- `findAll(pagination?)` - Find all records with optional pagination
- `findBy(field, value)` - Find records by field value
- `create(data)` - Create a new record
- `update(id, data)` - Update a record
- `delete(id)` - Delete a record
- `exists(id)` - Check if a record exists
- `count()` - Count total records

### 4. Validation Utilities

The `validation.ts` module provides comprehensive validation functions:

```typescript
import { validateEmail, validateUrl, validatePassword } from './models'

// Validate email
validateEmail('user@example.com') // Throws ValidationError if invalid

// Validate URL
validateUrl('https://example.com') // Throws ValidationError if invalid

// Validate password strength
validatePassword('SecurePass123') // Throws ValidationError if weak
```

### 5. Sanitization Utilities

The `sanitization.ts` module provides data cleaning functions:

```typescript
import { sanitizeEmail, sanitizeUrl, sanitizeString } from './models'

// Sanitize email
const email = sanitizeEmail('  USER@EXAMPLE.COM  ') // 'user@example.com'

// Sanitize URL
const url = sanitizeUrl('https://example.com/') // 'https://example.com'

// Sanitize string
const text = sanitizeString('  Hello   World  ') // 'Hello World'
```

### 6. Query Helpers

The `queryHelpers.ts` module provides common query patterns:

```typescript
import { selectWhere, countWhere, selectPaginated } from './models'

// Select with conditions
const users = await selectWhere('users', { subscription_tier: 'pro' })

// Count with conditions
const count = await countWhere('analysis_sessions', { status: 'completed' })

// Paginated query
const result = await selectPaginated(
  'users',
  { subscription_tier: 'pro' },
  { limit: 10, offset: 0 }
)
```

## Repository Usage Examples

### User Repository

```typescript
import { userRepository } from './models'

// Create a new user
const user = await userRepository.createUser({
  email: 'user@example.com',
  password: 'SecurePass123',
  first_name: 'John',
  last_name: 'Doe',
  company: 'Acme Inc',
  subscription_tier: 'pro'
})

// Find user by email
const foundUser = await userRepository.findByEmail('user@example.com')

// Verify password
const verifiedUser = await userRepository.verifyPassword(
  'user@example.com',
  'SecurePass123'
)

// Update last login
await userRepository.updateLastLogin(user.id)

// Update user information
await userRepository.updateUser(user.id, {
  first_name: 'Jane',
  subscription_tier: 'enterprise'
})
```

### Analysis Session Repository

```typescript
import { analysisSessionRepository } from './models'

// Create a new analysis session
const session = await analysisSessionRepository.createSession({
  user_id: userId,
  website_url: 'https://example.com',
  target_location: 'United States',
  competitor_urls: ['https://competitor1.com', 'https://competitor2.com']
})

// Find sessions by user
const userSessions = await analysisSessionRepository.findByUserId(userId)

// Update session status
await analysisSessionRepository.updateStatus(session.id, 'processing')

// Update session with analysis data
await analysisSessionRepository.updateSession(session.id, {
  status: 'completed',
  completed_at: new Date(),
  analysis_data: {
    executive_summary: 'Analysis complete',
    key_findings: ['Finding 1', 'Finding 2'],
    processing_time_ms: 5000
  }
})

// Find recent sessions
const recentSessions = await analysisSessionRepository.findRecentByUserId(
  userId,
  5
)
```

### Website Analysis Repository

```typescript
import { websiteAnalysisRepository } from './models'

// Create website analysis
const analysis = await websiteAnalysisRepository.createAnalysis({
  session_id: sessionId,
  url: 'https://example.com',
  business_model: 'saas',
  value_propositions: [
    {
      proposition: 'Fast and reliable service',
      category: 'performance',
      strength: 0.9
    }
  ],
  target_audience: {
    demographics: {
      age_ranges: ['25-34', '35-44'],
      genders: ['all'],
      locations: ['United States']
    },
    pain_points: ['Slow processes', 'High costs']
  }
})

// Find analysis by session
const sessionAnalysis = await websiteAnalysisRepository.findBySessionId(
  sessionId
)

// Find recent analyses for a URL
const recentAnalyses = await websiteAnalysisRepository.findRecentByUrl(
  'https://example.com',
  5
)
```

### Competitor Analysis Repository

```typescript
import { competitorAnalysisRepository } from './models'

// Create competitor analysis
const competitorAnalysis = await competitorAnalysisRepository.createAnalysis({
  session_id: sessionId,
  competitor_url: 'https://competitor.com',
  positioning: {
    unique_value_proposition: 'Best in class service',
    target_market: 'Enterprise',
    competitive_advantages: ['Price', 'Quality']
  },
  audience_insights: {
    demographics: {
      age_ranges: ['35-54'],
      job_titles: ['Manager', 'Director']
    }
  }
})

// Find all competitor analyses for a session
const competitors = await competitorAnalysisRepository.findBySessionId(
  sessionId
)

// Count competitor analyses
const count = await competitorAnalysisRepository.countBySessionId(sessionId)
```

### Targeting Recommendation Repository

```typescript
import { targetingRecommendationRepository } from './models'

// Create Meta targeting recommendation
const metaRecommendation = await targetingRecommendationRepository.createRecommendation({
  session_id: sessionId,
  platform: 'meta',
  targeting_data: {
    demographics: {
      age_min: 25,
      age_max: 54,
      genders: ['all'],
      locations: [{ type: 'country', name: 'United States' }]
    },
    interests: [
      {
        category: 'Business',
        interests: ['Entrepreneurship', 'Marketing'],
        confidence: 0.85,
        reasoning: 'Based on website content analysis'
      }
    ],
    behaviors: []
  },
  confidence_scores: [
    {
      category: 'demographics',
      score: 0.9,
      factors: ['Website content', 'Industry analysis']
    }
  ]
})

// Find recommendation by session and platform
const recommendation = await targetingRecommendationRepository.findBySessionAndPlatform(
  sessionId,
  'meta'
)

// Find all recommendations for a session
const allRecommendations = await targetingRecommendationRepository.findBySessionId(
  sessionId
)
```

### Export History Repository

```typescript
import { exportHistoryRepository } from './models'

// Create export record
const exportRecord = await exportHistoryRepository.createExport({
  session_id: sessionId,
  export_type: 'meta_csv',
  filename: 'meta_audiences_2024-01-15.csv',
  export_data: {
    format: 'csv',
    row_count: 25,
    file_size_bytes: 4096
  }
})

// Find exports by session
const exports = await exportHistoryRepository.findBySessionId(sessionId)

// Find exports by type
const csvExports = await exportHistoryRepository.findByExportType('meta_csv')

// Count exports
const exportCount = await exportHistoryRepository.countBySessionId(sessionId)
```

### Analysis Cache Repository

```typescript
import { analysisCacheRepository } from './models'

// Set cached data with TTL
await analysisCacheRepository.setCachedData(
  'website_analysis:https://example.com',
  { business_model: 'saas', confidence: 0.9 },
  3600 // 1 hour TTL
)

// Get cached data
const cachedData = await analysisCacheRepository.getCachedData(
  'website_analysis:https://example.com'
)

// Delete expired cache
const deletedCount = await analysisCacheRepository.deleteExpiredCache()

// Get cache statistics
const stats = await analysisCacheRepository.getCacheStats()
// { total: 100, expired: 10, active: 90 }
```

## Error Handling

All repositories throw typed errors:

```typescript
import { DatabaseError, ValidationError } from './models'

try {
  const user = await userRepository.createUser({
    email: 'invalid-email',
    password: 'weak'
  })
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message, error.field)
  } else if (error instanceof DatabaseError) {
    console.error('Database error:', error.message, error.code)
  }
}
```

## Best Practices

1. **Always use repositories** - Never write raw SQL queries in application code
2. **Validate before saving** - Use validation utilities before creating/updating records
3. **Sanitize user input** - Always sanitize data from external sources
4. **Use transactions** - For operations that modify multiple tables
5. **Handle errors gracefully** - Catch and handle ValidationError and DatabaseError
6. **Use pagination** - For queries that may return large result sets
7. **Cache frequently accessed data** - Use AnalysisCacheRepository for performance
8. **Clean up old data** - Use cleanup methods to remove expired/old records

## Transaction Example

```typescript
import { pool } from '../config/database'

// Execute multiple operations in a transaction
const connection = await pool.getConnection()
await connection.beginTransaction()

try {
  // Create session
  const session = await analysisSessionRepository.createSession({
    user_id: userId,
    website_url: 'https://example.com'
  })

  // Create website analysis
  await websiteAnalysisRepository.createAnalysis({
    session_id: session.id,
    url: 'https://example.com',
    business_model: 'saas'
  })

  // Create targeting recommendations
  await targetingRecommendationRepository.createRecommendation({
    session_id: session.id,
    platform: 'meta',
    targeting_data: { /* ... */ }
  })

  await connection.commit()
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  connection.release()
}
```

## Testing

All repositories should be tested with:
- Unit tests for individual methods
- Integration tests with actual database
- Property-based tests for data integrity

See the `*.test.ts` files for examples.

## Performance Considerations

1. **Use indexes** - Ensure proper indexes on frequently queried fields
2. **Limit result sets** - Always use pagination for large queries
3. **Cache results** - Use AnalysisCacheRepository for expensive operations
4. **Batch operations** - Use batch insert/update for multiple records
5. **Connection pooling** - Configured in `config/database.ts`

## Security Considerations

1. **Parameterized queries** - All repositories use parameterized queries to prevent SQL injection
2. **Input validation** - Always validate input before database operations
3. **Data sanitization** - Sanitize all user input to prevent XSS and other attacks
4. **Password hashing** - Passwords are hashed with bcrypt (10 rounds)
5. **Access control** - Implement proper authorization checks in application layer

## Migration

Database schema changes should be managed through migrations in `backend/migrations/`.

See `backend/migrations/README.md` for migration guidelines.
