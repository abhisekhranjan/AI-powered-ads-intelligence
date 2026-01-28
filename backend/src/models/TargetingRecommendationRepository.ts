/**
 * Targeting Recommendation Repository - Database access layer for targeting_recommendations table
 */

import { RowDataPacket } from 'mysql2/promise'
import { BaseRepository } from './BaseRepository.js'
import {
  TargetingRecommendation,
  CreateTargetingRecommendationInput,
  AdPlatform
} from './types.js'
import { v4 as uuidv4 } from 'uuid'
import { query } from '../config/database.js'

export class TargetingRecommendationRepository extends BaseRepository<TargetingRecommendation> {
  constructor() {
    super('targeting_recommendations')
  }

  /**
   * Map database row to TargetingRecommendation model
   */
  protected mapRowToModel(row: RowDataPacket): TargetingRecommendation {
    const targetingData = this.parseJsonField(row.targeting_data)
    return {
      id: row.id,
      session_id: row.session_id,
      platform: row.platform,
      targeting_data: targetingData || {} as any,
      confidence_scores: this.parseJsonField(row.confidence_scores),
      explanations: this.parseJsonField(row.explanations),
      created_at: row.created_at
    }
  }

  /**
   * Create a new targeting recommendation
   */
  async createRecommendation(
    input: CreateTargetingRecommendationInput
  ): Promise<TargetingRecommendation> {
    const recommendationData: Partial<TargetingRecommendation> = {
      id: uuidv4(),
      session_id: input.session_id,
      platform: input.platform,
      targeting_data: input.targeting_data,
      confidence_scores: input.confidence_scores || null,
      explanations: input.explanations || null,
      created_at: new Date()
    }

    // Serialize JSON fields
    const dbData: any = {
      ...recommendationData,
      targeting_data: this.serializeJsonField(recommendationData.targeting_data),
      confidence_scores: this.serializeJsonField(recommendationData.confidence_scores),
      explanations: this.serializeJsonField(recommendationData.explanations)
    }

    const recommendationId = await this.create(dbData)
    const recommendation = await this.findById(recommendationId)
    
    if (!recommendation) {
      throw new Error('Failed to retrieve created targeting recommendation')
    }

    return recommendation
  }

  /**
   * Find recommendations by session ID
   */
  async findBySessionId(sessionId: string): Promise<TargetingRecommendation[]> {
    return this.findBy('session_id', sessionId)
  }

  /**
   * Find recommendation by session ID and platform
   */
  async findBySessionAndPlatform(
    sessionId: string,
    platform: AdPlatform
  ): Promise<TargetingRecommendation | null> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE session_id = ? AND platform = ?
        LIMIT 1
      `
      const results = await query<RowDataPacket[]>(sql, [sessionId, platform])
      
      if (results.length === 0) {
        return null
      }
      
      return this.mapRowToModel(results[0])
    } catch (error) {
      throw new Error(`Failed to find recommendation by session and platform: ${error}`)
    }
  }

  /**
   * Find all Meta recommendations
   */
  async findMetaRecommendations(): Promise<TargetingRecommendation[]> {
    return this.findBy('platform', 'meta')
  }

  /**
   * Find all Google recommendations
   */
  async findGoogleRecommendations(): Promise<TargetingRecommendation[]> {
    return this.findBy('platform', 'google')
  }

  /**
   * Update targeting recommendation
   */
  async updateRecommendation(
    id: string,
    updates: Partial<CreateTargetingRecommendationInput>
  ): Promise<TargetingRecommendation | null> {
    const updateData: any = {}

    if (updates.targeting_data !== undefined) {
      updateData.targeting_data = this.serializeJsonField(updates.targeting_data)
    }
    if (updates.confidence_scores !== undefined) {
      updateData.confidence_scores = this.serializeJsonField(updates.confidence_scores)
    }
    if (updates.explanations !== undefined) {
      updateData.explanations = this.serializeJsonField(updates.explanations)
    }

    const updated = await this.update(id, updateData)
    
    if (!updated) {
      return null
    }

    return this.findById(id)
  }

  /**
   * Count recommendations by platform
   */
  async countByPlatform(platform: AdPlatform): Promise<number> {
    try {
      const sql = `
        SELECT COUNT(*) as total
        FROM ${this.tableName}
        WHERE platform = ?
      `
      const results = await query<RowDataPacket[]>(sql, [platform])
      return results[0].total
    } catch (error) {
      throw new Error(`Failed to count recommendations by platform: ${error}`)
    }
  }

  /**
   * Find recent recommendations for a session
   */
  async findRecentBySessionId(
    sessionId: string,
    limit: number = 10
  ): Promise<TargetingRecommendation[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `
      const results = await query<RowDataPacket[]>(sql, [sessionId, limit])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new Error(`Failed to find recent recommendations: ${error}`)
    }
  }

  /**
   * Delete recommendations older than specified days
   */
  async deleteOldRecommendations(daysOld: number = 90): Promise<number> {
    try {
      const sql = `
        DELETE FROM ${this.tableName}
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `
      const result = await query<any>(sql, [daysOld])
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete old recommendations: ${error}`)
    }
  }

  /**
   * Delete all recommendations for a session
   */
  async deleteBySessionId(sessionId: string): Promise<number> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE session_id = ?`
      const result = await query<any>(sql, [sessionId])
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete recommendations by session: ${error}`)
    }
  }
}

// Export singleton instance
export const targetingRecommendationRepository = new TargetingRecommendationRepository()
