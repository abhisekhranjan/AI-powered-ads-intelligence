import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('Database Migration Schema', () => {
  let migrationSQL: string

  beforeAll(async () => {
    // Read the migration file
    const migrationPath = join(__dirname, '../../migrations/001_create_schema.sql')
    migrationSQL = await readFile(migrationPath, 'utf-8')
  })

  describe('Table Creation', () => {
    it('should create users table with all required columns', () => {
      expect(migrationSQL).toContain('CREATE TABLE users')
      expect(migrationSQL).toContain('id VARCHAR(36) PRIMARY KEY')
      expect(migrationSQL).toContain('email VARCHAR(255) UNIQUE NOT NULL')
      expect(migrationSQL).toContain('password_hash VARCHAR(255) NOT NULL')
      expect(migrationSQL).toContain('first_name VARCHAR(100)')
      expect(migrationSQL).toContain('last_name VARCHAR(100)')
      expect(migrationSQL).toContain('company VARCHAR(200)')
      expect(migrationSQL).toContain("subscription_tier ENUM('free', 'pro', 'enterprise') DEFAULT 'free'")
      expect(migrationSQL).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
      expect(migrationSQL).toContain('last_login TIMESTAMP NULL')
    })

    it('should create analysis_sessions table with all required columns', () => {
      expect(migrationSQL).toContain('CREATE TABLE analysis_sessions')
      expect(migrationSQL).toContain('id VARCHAR(36) PRIMARY KEY')
      expect(migrationSQL).toContain('user_id VARCHAR(36) NOT NULL')
      expect(migrationSQL).toContain('website_url VARCHAR(500) NOT NULL')
      expect(migrationSQL).toContain('target_location VARCHAR(100)')
      expect(migrationSQL).toContain('competitor_urls JSON')
      expect(migrationSQL).toContain("status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending'")
      expect(migrationSQL).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
      expect(migrationSQL).toContain('completed_at TIMESTAMP NULL')
      expect(migrationSQL).toContain('analysis_data JSON')
    })

    it('should create website_analyses table with all required columns', () => {
      expect(migrationSQL).toContain('CREATE TABLE website_analyses')
      expect(migrationSQL).toContain('id VARCHAR(36) PRIMARY KEY')
      expect(migrationSQL).toContain('session_id VARCHAR(36) NOT NULL')
      expect(migrationSQL).toContain('url VARCHAR(500) NOT NULL')
      expect(migrationSQL).toContain('business_model VARCHAR(100)')
      expect(migrationSQL).toContain('value_propositions JSON')
      expect(migrationSQL).toContain('target_audience JSON')
      expect(migrationSQL).toContain('content_themes JSON')
      expect(migrationSQL).toContain('technical_metadata JSON')
      expect(migrationSQL).toContain('analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    })

    it('should create competitor_analyses table with all required columns', () => {
      expect(migrationSQL).toContain('CREATE TABLE competitor_analyses')
      expect(migrationSQL).toContain('id VARCHAR(36) PRIMARY KEY')
      expect(migrationSQL).toContain('session_id VARCHAR(36) NOT NULL')
      expect(migrationSQL).toContain('competitor_url VARCHAR(500) NOT NULL')
      expect(migrationSQL).toContain('positioning JSON')
      expect(migrationSQL).toContain('audience_insights JSON')
      expect(migrationSQL).toContain('content_strategy JSON')
      expect(migrationSQL).toContain('market_share_data JSON')
      expect(migrationSQL).toContain('analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    })

    it('should create targeting_recommendations table with all required columns', () => {
      expect(migrationSQL).toContain('CREATE TABLE targeting_recommendations')
      expect(migrationSQL).toContain('id VARCHAR(36) PRIMARY KEY')
      expect(migrationSQL).toContain('session_id VARCHAR(36) NOT NULL')
      expect(migrationSQL).toContain("platform ENUM('meta', 'google') NOT NULL")
      expect(migrationSQL).toContain('targeting_data JSON NOT NULL')
      expect(migrationSQL).toContain('confidence_scores JSON')
      expect(migrationSQL).toContain('explanations JSON')
      expect(migrationSQL).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    })

    it('should create export_history table with all required columns', () => {
      expect(migrationSQL).toContain('CREATE TABLE export_history')
      expect(migrationSQL).toContain('id VARCHAR(36) PRIMARY KEY')
      expect(migrationSQL).toContain('session_id VARCHAR(36) NOT NULL')
      expect(migrationSQL).toContain("export_type ENUM('meta_csv', 'google_csv', 'client_report', 'clipboard') NOT NULL")
      expect(migrationSQL).toContain('filename VARCHAR(255)')
      expect(migrationSQL).toContain('export_data JSON')
      expect(migrationSQL).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    })

    it('should create analysis_cache table with all required columns', () => {
      expect(migrationSQL).toContain('CREATE TABLE analysis_cache')
      expect(migrationSQL).toContain('id VARCHAR(36) PRIMARY KEY')
      expect(migrationSQL).toContain('cache_key VARCHAR(255) UNIQUE NOT NULL')
      expect(migrationSQL).toContain('cache_data JSON NOT NULL')
      expect(migrationSQL).toContain('expires_at TIMESTAMP NOT NULL')
      expect(migrationSQL).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    })
  })

  describe('Foreign Key Relationships', () => {
    it('should define foreign key from analysis_sessions to users', () => {
      expect(migrationSQL).toContain('FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE')
    })

    it('should define foreign key from website_analyses to analysis_sessions', () => {
      const websiteAnalysesSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE website_analyses'),
        migrationSQL.indexOf('CREATE TABLE competitor_analyses')
      )
      expect(websiteAnalysesSection).toContain('FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE')
    })

    it('should define foreign key from competitor_analyses to analysis_sessions', () => {
      const competitorAnalysesSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE competitor_analyses'),
        migrationSQL.indexOf('CREATE TABLE targeting_recommendations')
      )
      expect(competitorAnalysesSection).toContain('FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE')
    })

    it('should define foreign key from targeting_recommendations to analysis_sessions', () => {
      const targetingSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE targeting_recommendations'),
        migrationSQL.indexOf('CREATE TABLE export_history')
      )
      expect(targetingSection).toContain('FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE')
    })

    it('should define foreign key from export_history to analysis_sessions', () => {
      const exportSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE export_history'),
        migrationSQL.indexOf('CREATE TABLE analysis_cache')
      )
      expect(exportSection).toContain('FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE')
    })
  })

  describe('Indexes', () => {
    it('should create indexes on users table', () => {
      const usersSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE users'),
        migrationSQL.indexOf('CREATE TABLE analysis_sessions')
      )
      expect(usersSection).toContain('INDEX idx_email (email)')
      expect(usersSection).toContain('INDEX idx_subscription (subscription_tier)')
    })

    it('should create indexes on analysis_sessions table', () => {
      const sessionsSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE analysis_sessions'),
        migrationSQL.indexOf('CREATE TABLE website_analyses')
      )
      expect(sessionsSection).toContain('INDEX idx_user_created (user_id, created_at)')
      expect(sessionsSection).toContain('INDEX idx_status (status)')
    })

    it('should create indexes on website_analyses table', () => {
      const websiteSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE website_analyses'),
        migrationSQL.indexOf('CREATE TABLE competitor_analyses')
      )
      expect(websiteSection).toContain('INDEX idx_session (session_id)')
      expect(websiteSection).toContain('INDEX idx_url (url)')
    })

    it('should create indexes on competitor_analyses table', () => {
      const competitorSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE competitor_analyses'),
        migrationSQL.indexOf('CREATE TABLE targeting_recommendations')
      )
      expect(competitorSection).toContain('INDEX idx_session (session_id)')
      expect(competitorSection).toContain('INDEX idx_competitor_url (competitor_url)')
    })

    it('should create indexes on targeting_recommendations table', () => {
      const targetingSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE targeting_recommendations'),
        migrationSQL.indexOf('CREATE TABLE export_history')
      )
      expect(targetingSection).toContain('INDEX idx_session_platform (session_id, platform)')
    })

    it('should create indexes on export_history table', () => {
      const exportSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE export_history'),
        migrationSQL.indexOf('CREATE TABLE analysis_cache')
      )
      expect(exportSection).toContain('INDEX idx_session_type (session_id, export_type)')
      expect(exportSection).toContain('INDEX idx_created (created_at)')
    })

    it('should create indexes on analysis_cache table', () => {
      const cacheSection = migrationSQL.substring(
        migrationSQL.indexOf('CREATE TABLE analysis_cache')
      )
      expect(cacheSection).toContain('INDEX idx_cache_key (cache_key)')
      expect(cacheSection).toContain('INDEX idx_expires (expires_at)')
    })
  })

  describe('Data Types', () => {
    it('should use VARCHAR(36) for UUID fields', () => {
      const uuidFields = migrationSQL.match(/id VARCHAR\(36\) PRIMARY KEY/g)
      expect(uuidFields).toHaveLength(7) // 7 tables with UUID primary keys
    })

    it('should use JSON type for complex data fields', () => {
      expect(migrationSQL).toContain('competitor_urls JSON')
      expect(migrationSQL).toContain('analysis_data JSON')
      expect(migrationSQL).toContain('value_propositions JSON')
      expect(migrationSQL).toContain('target_audience JSON')
      expect(migrationSQL).toContain('content_themes JSON')
      expect(migrationSQL).toContain('technical_metadata JSON')
      expect(migrationSQL).toContain('positioning JSON')
      expect(migrationSQL).toContain('audience_insights JSON')
      expect(migrationSQL).toContain('content_strategy JSON')
      expect(migrationSQL).toContain('market_share_data JSON')
      expect(migrationSQL).toContain('targeting_data JSON NOT NULL')
      expect(migrationSQL).toContain('confidence_scores JSON')
      expect(migrationSQL).toContain('explanations JSON')
      expect(migrationSQL).toContain('export_data JSON')
      expect(migrationSQL).toContain('cache_data JSON NOT NULL')
    })

    it('should use ENUM for status fields', () => {
      expect(migrationSQL).toContain("status ENUM('pending', 'processing', 'completed', 'failed')")
      expect(migrationSQL).toContain("subscription_tier ENUM('free', 'pro', 'enterprise')")
      expect(migrationSQL).toContain("platform ENUM('meta', 'google')")
      expect(migrationSQL).toContain("export_type ENUM('meta_csv', 'google_csv', 'client_report', 'clipboard')")
    })

    it('should use TIMESTAMP for date fields', () => {
      const timestampFields = migrationSQL.match(/TIMESTAMP/g)
      expect(timestampFields!.length).toBeGreaterThan(10) // Multiple timestamp fields across tables
    })
  })

  describe('Table Order', () => {
    it('should create tables in correct order to satisfy foreign key constraints', () => {
      const usersPos = migrationSQL.indexOf('CREATE TABLE users')
      const sessionsPos = migrationSQL.indexOf('CREATE TABLE analysis_sessions')
      const websitePos = migrationSQL.indexOf('CREATE TABLE website_analyses')
      const competitorPos = migrationSQL.indexOf('CREATE TABLE competitor_analyses')
      const targetingPos = migrationSQL.indexOf('CREATE TABLE targeting_recommendations')
      const exportPos = migrationSQL.indexOf('CREATE TABLE export_history')

      // Users must come before analysis_sessions
      expect(usersPos).toBeLessThan(sessionsPos)
      
      // analysis_sessions must come before all dependent tables
      expect(sessionsPos).toBeLessThan(websitePos)
      expect(sessionsPos).toBeLessThan(competitorPos)
      expect(sessionsPos).toBeLessThan(targetingPos)
      expect(sessionsPos).toBeLessThan(exportPos)
    })
  })
})
