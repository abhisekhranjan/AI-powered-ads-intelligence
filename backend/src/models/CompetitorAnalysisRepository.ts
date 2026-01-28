/**
 * Competitor Analysis Repository - Database access layer for competitor_analyses table
 */

import { RowDataPacket } from 'mysql2/promise'
import { BaseRepository } from './BaseRepository.js'
import { CompetitorAnalysis, CreateCompetitorAnalysisInput } from './types.js'
import { v4 as uuidv4 } from 'uuid'
import { query } from '../config/database.js'

export class CompetitorAnalysisRepository extends BaseRepository<CompetitorAnalysis> {
  constructor() {
    super('competitor_analyses')
  }

  /**
   * Map database row to CompetitorAnalysis model
   */
  protected mapRowToModel(row: RowDataPacket): CompetitorAnalysis {
    return {
      id: row.id,
      session_id: row.session_id,
      competitor_url: row.competitor_url,
      positioning: this.parseJsonField(row.positioning),
      audience_insights: this.parseJsonField(row.audience_insights),
      content_strategy: this.parseJsonField(row.content_strategy),
      market_share_data: this.parseJsonField(row.market_share_data),
      analysis_timestamp: row.analysis_timestamp
    }
  }

  /**
   * Create a new competitor analysis
   */
  async createAnalysis(input: CreateCompetitorAnalysisInput): Promise<CompetitorAnalysis> {
    const analysisData: Partial<CompetitorAnalysis> = {
      id: uuidv4(),
      session_id: input.session_id,
      competitor_url: input.competitor_url,
      positioning: input.positioning || null,
      audience_insights: input.audience_insights || null,
      content_strategy: input.content_strategy || null,
      market_share_data: input.market_share_data || null,
      analysis_timestamp: new Date()
    }

    // Serialize JSON fields
    const dbData: any = {
      ...analysisData,
      positioning: this.serializeJsonField(analysisData.positioning),
      audience_insights: this.serializeJsonField(analysisData.audience_insights),
      content_strategy: this.serializeJsonField(analysisData.content_strategy),
      market_share_data: this.serializeJsonField(analysisData.market_share_data)
    }

    const analysisId = await this.create(dbData)
    const analysis = await this.findById(analysisId)
    
    if (!analysis) {
      throw new Error('Failed to retrieve created competitor analysis')
    }

    return analysis
  }

  /**
   * Find all competitor analyses for a session
   */
  async findBySessionId(sessionId: string): Promise<CompetitorAnalysis[]> {
    return this.findBy('session_id', sessionId)
  }

  /**
   * Find analyses by competitor URL
   */
  async findByCompetitorUrl(url: string): Promise<CompetitorAnalysis[]> {
    return this.findBy('competitor_url', url)
  }

  /**
   * Find recent analyses for a competitor URL
   */
  async findRecentByUrl(url: string, limit: number = 5): Promise<CompetitorAnalysis[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE competitor_url = ?
        ORDER BY analysis_timestamp DESC
        LIMIT ?
      `
      const results = await query<RowDataPacket[]>(sql, [url, limit])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new Error(`Failed to find recent competitor analyses: ${error}`)
    }
  }

  /**
   * Update competitor analysis
   */
  async updateAnalysis(
    id: string,
    updates: Partial<CreateCompetitorAnalysisInput>
  ): Promise<CompetitorAnalysis | null> {
    const updateData: any = {}

    if (updates.positioning !== undefined) {
      updateData.positioning = this.serializeJsonField(updates.positioning)
    }
    if (updates.audience_insights !== undefined) {
      updateData.audience_insights = this.serializeJsonField(updates.audience_insights)
    }
    if (updates.content_strategy !== undefined) {
      updateData.content_strategy = this.serializeJsonField(updates.content_strategy)
    }
    if (updates.market_share_data !== undefined) {
      updateData.market_share_data = this.serializeJsonField(updates.market_share_data)
    }

    const updated = await this.update(id, updateData)
    
    if (!updated) {
      return null
    }

    return this.findById(id)
  }

  /**
   * Count competitor analyses for a session
   */
  async countBySessionId(sessionId: string): Promise<number> {
    try {
      const sql = `
        SELECT COUNT(*) as total
        FROM ${this.tableName}
        WHERE session_id = ?
      `
      const results = await query<RowDataPacket[]>(sql, [sessionId])
      return results[0].total
    } catch (error) {
      throw new Error(`Failed to count competitor analyses: ${error}`)
    }
  }

  /**
   * Delete analyses older than specified days
   */
  async deleteOldAnalyses(daysOld: number = 90): Promise<number> {
    try {
      const sql = `
        DELETE FROM ${this.tableName}
        WHERE analysis_timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
      `
      const result = await query<any>(sql, [daysOld])
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete old competitor analyses: ${error}`)
    }
  }

  /**
   * Delete all competitor analyses for a session
   */
  async deleteBySessionId(sessionId: string): Promise<number> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE session_id = ?`
      const result = await query<any>(sql, [sessionId])
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete competitor analyses by session: ${error}`)
    }
  }
}

// Export singleton instance
export const competitorAnalysisRepository = new CompetitorAnalysisRepository()
