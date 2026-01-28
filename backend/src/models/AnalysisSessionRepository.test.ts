/**
 * Unit tests for AnalysisSessionRepository
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { analysisSessionRepository } from './AnalysisSessionRepository.js'
import { userRepository } from './UserRepository.js'
import { pool } from '../config/database.js'
import { ValidationError } from './types.js'

describe('AnalysisSessionRepository', () => {
  let testUserId: string

  // Create a test user before each test
  beforeEach(async () => {
    const user = await userRepository.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    })
    testUserId = user.id
  })

  // Clean up test data after each test
  afterEach(async () => {
    await pool.execute('DELETE FROM analysis_sessions WHERE user_id = ?', [testUserId])
    await pool.execute('DELETE FROM users WHERE id = ?', [testUserId])
  })

  describe('createSession', () => {
    it('should create a new analysis session with valid data', async () => {
      const input = {
        user_id: testUserId,
        website_url: 'https://example.com',
        target_location: 'United States',
        competitor_urls: ['https://competitor1.com', 'https://competitor2.com']
      }

      const session = await analysisSessionRepository.createSession(input)

      expect(session).toBeDefined()
      expect(session.user_id).toBe(input.user_id)
      expect(session.website_url).toBe(input.website_url)
      expect(session.target_location).toBe(input.target_location)
      expect(session.competitor_urls).toEqual(input.competitor_urls)
      expect(session.status).toBe('pending')
      expect(session.id).toBeDefined()
    })

    it('should create session with minimal data', async () => {
      const input = {
        user_id: testUserId,
        website_url: 'https://example.com'
      }

      const session = await analysisSessionRepository.createSession(input)

      expect(session).toBeDefined()
      expect(session.website_url).toBe(input.website_url)
      expect(session.target_location).toBeNull()
      expect(session.competitor_urls).toBeNull()
      expect(session.status).toBe('pending')
    })

    it('should throw ValidationError for invalid URL', async () => {
      const input = {
        user_id: testUserId,
        website_url: 'not-a-valid-url'
      }

      await expect(analysisSessionRepository.createSession(input)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for invalid competitor URL', async () => {
      const input = {
        user_id: testUserId,
        website_url: 'https://example.com',
        competitor_urls: ['https://valid.com', 'invalid-url']
      }

      await expect(analysisSessionRepository.createSession(input)).rejects.toThrow(ValidationError)
    })
  })

  describe('updateSession', () => {
    it('should update session status', async () => {
      const session = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example.com'
      })

      const updated = await analysisSessionRepository.updateSession(session.id, {
        status: 'processing'
      })

      expect(updated).toBeDefined()
      expect(updated?.status).toBe('processing')
    })

    it('should update session with analysis data', async () => {
      const session = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example.com'
      })

      const analysisData = {
        executive_summary: 'Test summary',
        key_findings: ['Finding 1', 'Finding 2'],
        processing_time_ms: 5000
      }

      const updated = await analysisSessionRepository.updateSession(session.id, {
        status: 'completed',
        completed_at: new Date(),
        analysis_data: analysisData
      })

      expect(updated).toBeDefined()
      expect(updated?.status).toBe('completed')
      expect(updated?.analysis_data).toEqual(analysisData)
      expect(updated?.completed_at).toBeDefined()
    })
  })

  describe('updateStatus', () => {
    it('should update status to completed and set completed_at', async () => {
      const session = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example.com'
      })

      await analysisSessionRepository.updateStatus(session.id, 'completed')
      
      const updated = await analysisSessionRepository.findById(session.id)
      expect(updated?.status).toBe('completed')
      expect(updated?.completed_at).toBeDefined()
    })

    it('should update status to failed and set completed_at', async () => {
      const session = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example.com'
      })

      await analysisSessionRepository.updateStatus(session.id, 'failed')
      
      const updated = await analysisSessionRepository.findById(session.id)
      expect(updated?.status).toBe('failed')
      expect(updated?.completed_at).toBeDefined()
    })
  })

  describe('findByUserId', () => {
    it('should find all sessions for a user', async () => {
      await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example1.com'
      })

      await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example2.com'
      })

      const sessions = await analysisSessionRepository.findByUserId(testUserId)

      expect(sessions.length).toBe(2)
      expect(sessions.every(s => s.user_id === testUserId)).toBe(true)
    })
  })

  describe('findByStatus', () => {
    it('should find sessions by status', async () => {
      const session = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example.com'
      })

      await analysisSessionRepository.updateStatus(session.id, 'processing')

      const processingSessions = await analysisSessionRepository.findByStatus('processing')

      expect(processingSessions.length).toBeGreaterThanOrEqual(1)
      expect(processingSessions.some(s => s.id === session.id)).toBe(true)
    })
  })

  describe('findRecentByUserId', () => {
    it('should find recent sessions ordered by creation date', async () => {
      const session1 = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example1.com'
      })

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))

      const session2 = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example2.com'
      })

      const recent = await analysisSessionRepository.findRecentByUserId(testUserId, 10)

      expect(recent.length).toBe(2)
      // Most recent should be first
      expect(recent[0].id).toBe(session2.id)
      expect(recent[1].id).toBe(session1.id)
    })

    it('should limit results to specified count', async () => {
      for (let i = 0; i < 5; i++) {
        await analysisSessionRepository.createSession({
          user_id: testUserId,
          website_url: `https://example${i}.com`
        })
      }

      const recent = await analysisSessionRepository.findRecentByUserId(testUserId, 3)

      expect(recent.length).toBe(3)
    })
  })

  describe('findCompletedByUserId', () => {
    it('should find only completed sessions', async () => {
      const session1 = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example1.com'
      })
      await analysisSessionRepository.updateStatus(session1.id, 'completed')

      const session2 = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example2.com'
      })
      await analysisSessionRepository.updateStatus(session2.id, 'processing')

      const completed = await analysisSessionRepository.findCompletedByUserId(testUserId)

      expect(completed.length).toBe(1)
      expect(completed[0].id).toBe(session1.id)
      expect(completed[0].status).toBe('completed')
    })
  })

  describe('countByUserAndStatus', () => {
    it('should count sessions by user and status', async () => {
      const session1 = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example1.com'
      })
      await analysisSessionRepository.updateStatus(session1.id, 'completed')

      const session2 = await analysisSessionRepository.createSession({
        user_id: testUserId,
        website_url: 'https://example2.com'
      })
      await analysisSessionRepository.updateStatus(session2.id, 'completed')

      const count = await analysisSessionRepository.countByUserAndStatus(testUserId, 'completed')

      expect(count).toBe(2)
    })
  })
})
