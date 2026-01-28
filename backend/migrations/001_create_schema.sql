-- RiseRoutes AI Ads Intelligence Platform - Database Schema
-- Migration: 001_create_schema.sql
-- Description: Creates all core tables for the platform

-- Users and Authentication
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    subscription_tier ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_subscription (subscription_tier)
);

-- Analysis Sessions
CREATE TABLE analysis_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    target_location VARCHAR(100),
    competitor_urls JSON,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    analysis_data JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_status (status)
);

-- Website Analysis Results
CREATE TABLE website_analyses (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    url VARCHAR(500) NOT NULL,
    business_model VARCHAR(100),
    value_propositions JSON,
    target_audience JSON,
    content_themes JSON,
    technical_metadata JSON,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_url (url)
);

-- Competitor Analysis Results
CREATE TABLE competitor_analyses (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    competitor_url VARCHAR(500) NOT NULL,
    positioning JSON,
    audience_insights JSON,
    content_strategy JSON,
    market_share_data JSON,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_competitor_url (competitor_url)
);

-- Targeting Recommendations
CREATE TABLE targeting_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    platform ENUM('meta', 'google') NOT NULL,
    targeting_data JSON NOT NULL,
    confidence_scores JSON,
    explanations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_platform (session_id, platform)
);

-- Export History
CREATE TABLE export_history (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    export_type ENUM('meta_csv', 'google_csv', 'client_report', 'clipboard') NOT NULL,
    filename VARCHAR(255),
    export_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_type (session_id, export_type),
    INDEX idx_created (created_at)
);

-- Analysis Cache for Performance
CREATE TABLE analysis_cache (
    id VARCHAR(36) PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_data JSON NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cache_key (cache_key),
    INDEX idx_expires (expires_at)
);
