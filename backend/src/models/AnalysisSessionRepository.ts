/**
 * Analysis Session Repository - Database access layer for analysis_sessions table
 */

import { RowDataPacket } from 'mysql2/promise'
import { BaseRepository } from './BaseRepository.js'
import {
  AnalysisSession,
  CreateAnalysisSessionInput,
  UpdateAnalysisSessionInput,
  AnalysisStatus,
  ValidationError
} from './types.js'
import { v4 as uuidv4 } from 'uuid'
import { query } from '../config/database.js'

export class AnalysisSessionRepository extends BaseRepository<AnalysisSession> {
  constructor() {
    super('analysis_sessions')
  }

  /**
   * Map database row to AnalysisSession model
   */
  protected mapRowToModel(row: RowDataPacket): AnalysisSession {
    return {
      id: row.id,
      user_id: row.user_id,
      website_url: row.website_url,
      target_location: row.target_location,
      competitor_urls: this.parseJsonField<string[]>(row.competitor_urls),
      status: row.status,
      created_at: row.created_at,
      completed_at: row.completed_at,
      analysis_data: this.parseJsonField(row.analysis_data)
    }
  }

  /**
   * Create a new analysis session
   */
  async createSession(input: CreateAnalysisSessionInput): Promise<AnalysisSession> {
    // Validate URL format
    if (!this.isValidUrl(input.website_url)) {
      throw new ValidationError('Invalid website URL format', 'website_url', input.website_url)
    }

    // Validate competitor URLs if provided
    if (input.competitor_urls) {
      for (const url of input.competitor_urls) {
        if (!this.isValidUrl(url)) {
          throw new ValidationError('Invalid competitor URL format', 'competitor_urls', url)
        }
      }
    }

    const sessionData: Partial<AnalysisSession> = {
      id: uuidv4(),
      user_id: input.user_id,
      website_url: input.website_url,
      target_location: input.target_location || null,
      competitor_urls: input.competitor_urls || null,
      status: 'pending',
      created_at: new Date(),
      completed_at: null,
      analysis_data: null
    }

    // Serialize JSON fields
    const dbData: any = {
      ...sessionData,
      competitor_urls: this.serializeJsonField(sessionData.competitor_urls),
      analysis_data: this.serializeJsonField(sessionData.analysis_data)
    }

    const sessionId = await this.create(dbData)
    const session = await this.findById(sessionId)
    
    if (!session) {
      throw new Error('Failed to retrieve created analysis session')
    }

    return session
  }

  /**
   * Update analysis session
   */
  async updateSession(
    id: string,
    input: UpdateAnalysisSessionInput
  ): Promise<AnalysisSession | null> {
    const updateData: any = {}

    if (input.status !== undefined) {
      updateData.status = input.status
    }
    if (input.completed_at !== undefined) {
      updateData.completed_at = input.completed_at
    }
    if (input.analysis_data !== undefined) {
      updateData.analysis_data = this.serializeJsonField(input.analysis_data)
    }

    const updated = await this.update(id, updateData)
    
    if (!updated) {
      return null
    }

    return this.findById(id)
  }

  /**
   * Find sessions by user ID
   */
  async findByUserId(userId: string): Promise<AnalysisSession[]> {
    return this.findBy('user_id', userId)
  }

  /**
   * Find sessions by user ID with pagination
   */
  async findByUserIdPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<AnalysisSession[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
      const results = await query<RowDataPacket[]>(sql, [userId, limit, offset])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new Error(`Failed to find sessions by user ID: ${error}`)
    }
  }

  /**
   * Find sessions by status
   */
  async findByStatus(status: AnalysisStatus): Promise<AnalysisSession[]> {
    return this.findBy('status', status)
  }

  /**
   * Update session status
   */
  async updateStatus(id: string, status: AnalysisStatus): Promise<boolean> {
    const updateData: any = { status }
    
    // Set completed_at when status changes to completed or failed
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date()
    }

    return this.update(id, updateData)
  }

  /**
   * Find recent sessions for a user
   */
  async findRecentByUserId(userId: string, limit: number = 10): Promise<AnalysisSession[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `
      const results = await query<RowDataPacket[]>(sql, [userId, limit])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new Error(`Failed to find recent sessions: ${error}`)
    }
  }

  /**
   * Find completed sessions for a user
   */
  async findCompletedByUserId(userId: string): Promise<AnalysisSession[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE user_id = ? AND status = 'completed'
        ORDER BY completed_at DESC
      `
      const results = await query<RowDataPacket[]>(sql, [userId])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new Error(`Failed to find completed sessions: ${error}`)
    }
  }

  /**
   * Count sessions by user and status
   */
  async countByUserAndStatus(userId: string, status: AnalysisStatus): Promise<number> {
    try {
      const sql = `
        SELECT COUNT(*) as total
        FROM ${this.tableName}
        WHERE user_id = ? AND status = ?
      `
      const results = await query<RowDataPacket[]>(sql, [userId, status])
      return results[0].total
    } catch (error) {
      throw new Error(`Failed to count sessions: ${error}`)
    }
  }

  /**
   * Delete old failed sessions (cleanup utility)
   */
  async deleteOldFailedSessions(daysOld: number = 30): Promise<number> {
    try {
      const sql = `
        DELETE FROM ${this.tableName}
        WHERE status = 'failed'
        AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `
      const result = await query<any>(sql, [daysOld])
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete old failed sessions: ${error}`)
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const analysisSessionRepository = new AnalysisSessionRepository()
