# Database Migrations

This directory contains SQL migration files for the RiseRoutes AI Ads Intelligence Platform database schema.

## Migration Files

### 001_create_schema.sql

Creates the core database schema with the following tables:

#### 1. **users**
Stores user account information and authentication data.
- Primary Key: `id` (VARCHAR(36) - UUID)
- Unique: `email`
- Indexes: `idx_email`, `idx_subscription`
- Fields: email, password_hash, first_name, last_name, company, subscription_tier, created_at, last_login

#### 2. **analysis_sessions**
Tracks analysis sessions initiated by users.
- Primary Key: `id` (VARCHAR(36) - UUID)
- Foreign Key: `user_id` → `users(id)` (CASCADE DELETE)
- Indexes: `idx_user_created`, `idx_status`
- Fields: user_id, website_url, target_location, competitor_urls (JSON), status, created_at, completed_at, analysis_data (JSON)

#### 3. **website_analyses**
Stores detailed analysis results for target websites.
- Primary Key: `id` (VARCHAR(36) - UUID)
- Foreign Key: `session_id` → `analysis_sessions(id)` (CASCADE DELETE)
- Indexes: `idx_session`, `idx_url`
- Fields: session_id, url, business_model, value_propositions (JSON), target_audience (JSON), content_themes (JSON), technical_metadata (JSON), analysis_timestamp

#### 4. **competitor_analyses**
Stores analysis results for competitor websites.
- Primary Key: `id` (VARCHAR(36) - UUID)
- Foreign Key: `session_id` → `analysis_sessions(id)` (CASCADE DELETE)
- Indexes: `idx_session`, `idx_competitor_url`
- Fields: session_id, competitor_url, positioning (JSON), audience_insights (JSON), content_strategy (JSON), market_share_data (JSON), analysis_timestamp

#### 5. **targeting_recommendations**
Stores generated targeting recommendations for Meta and Google Ads.
- Primary Key: `id` (VARCHAR(36) - UUID)
- Foreign Key: `session_id` → `analysis_sessions(id)` (CASCADE DELETE)
- Indexes: `idx_session_platform`
- Fields: session_id, platform (ENUM: 'meta', 'google'), targeting_data (JSON), confidence_scores (JSON), explanations (JSON), created_at

#### 6. **export_history**
Tracks all data exports performed by users.
- Primary Key: `id` (VARCHAR(36) - UUID)
- Foreign Key: `session_id` → `analysis_sessions(id)` (CASCADE DELETE)
- Indexes: `idx_session_type`, `idx_created`
- Fields: session_id, export_type (ENUM: 'meta_csv', 'google_csv', 'client_report', 'clipboard'), filename, export_data (JSON), created_at

#### 7. **analysis_cache**
Caches analysis results for performance optimization.
- Primary Key: `id` (VARCHAR(36) - UUID)
- Unique: `cache_key`
- Indexes: `idx_cache_key`, `idx_expires`
- Fields: cache_key, cache_data (JSON), expires_at, created_at

## Entity Relationships

```
users (1) ──→ (N) analysis_sessions
analysis_sessions (1) ──→ (1) website_analyses
analysis_sessions (1) ──→ (N) competitor_analyses
analysis_sessions (1) ──→ (N) targeting_recommendations
analysis_sessions (1) ──→ (N) export_history
```

All foreign key relationships use `ON DELETE CASCADE` to maintain referential integrity.

## Running Migrations

### Prerequisites
1. MySQL 8.0+ installed and running
2. Database created (default: `riseroutes_dev`)
3. Environment variables configured in `backend/.env`

### Execute Migrations

```bash
# From the backend directory
npm run migrate
```

This will:
1. Create a `migrations` tracking table if it doesn't exist
2. Check which migrations have been executed
3. Run any pending migrations in order
4. Record successful migrations in the tracking table

### Manual Migration

If you need to run migrations manually:

```bash
mysql -u your_user -p your_database < migrations/001_create_schema.sql
```

## Migration Tracking

The system automatically tracks executed migrations in a `migrations` table:

```sql
CREATE TABLE migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Testing

Unit tests for the migration schema are located in `src/database/migrate.test.ts`.

Run tests:
```bash
npm test -- migrate.test.ts
```

The tests verify:
- All required tables are created
- All columns are defined correctly
- Foreign key relationships are properly set up
- Indexes are created on appropriate columns
- Data types are correct
- Tables are created in the correct order

## Design Reference

The database schema is defined in detail in:
`.kiro/specs/ai-ads-intelligence-platform/design.md`

Refer to the design document for:
- Complete data model specifications
- Entity relationship diagrams
- Business logic and constraints
- Performance considerations

## Notes

- All primary keys use VARCHAR(36) to store UUIDs
- JSON columns store complex nested data structures
- ENUM types enforce valid values for status and type fields
- Timestamps use MySQL's TIMESTAMP type with automatic defaults
- Indexes are strategically placed for common query patterns
- CASCADE DELETE ensures data consistency when parent records are removed
