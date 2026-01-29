-- Migration: 002_add_keywords_field.sql
-- Description: Adds keywords field to analysis_sessions table for keyword-enhanced targeting

ALTER TABLE analysis_sessions 
ADD COLUMN keywords JSON AFTER competitor_urls;
