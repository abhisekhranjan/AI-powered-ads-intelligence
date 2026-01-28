/**
 * Website Analysis Repository - Database access layer for website_analyses table
 */

import { RowDataPacket } from 'mysql2/promise'
import { BaseRepository } from './BaseRepository.js'
import { WebsiteAnalysis, CreateWebsiteAnalysisInput } from './types.js'
import { v4 as uuidv4 } from 'uuid'
import { query } from '../config/database.js'

export class WebsiteAnalysisRepository extends BaseRepository<WebsiteAnalysis> {
  constructor() {
    super('website_analyses')
  }

  /**
   * Map database row to WebsiteAnalysis model
   */
  protected mapRowToModel(row: RowDataPacket): WebsiteAnalysis {
    return {
      id: row.id,
      session_id: row.session_id,
      url: row.url,
      business_model: row.business_model,
      value_propositions: this.parseJsonField(row.value_propositions),
      target_audience: this.parseJsonField(row.target_audience),
      content_themes: this.parseJsonField(row.content_themes),
      technical_metadata: this.parseJsonField(row.technical_metadata),
      analysis_timestamp: row.analysis_timestamp
    }
  }

  /**
   * Create a new website analysis
   */
  async createAnalysis(input: CreateWebsiteAnalysisInput): Promise<WebsiteAnalysis> {
    const analysisData: Partial<WebsiteAnalysis> = {
      id: uuidv4(),
      session_id: input.session_id,
      url: input.url,
      business_model: input.business_model || null,
      value_propositions: input.value_propositions || null,
      target_audience: input.target_audience || null,
      content_themes: input.content_themes || null,
      technical_metadata: input.technical_metadata || null,
      analysis_timestamp: new Date()
    }

    // Serialize JSON fields
    const dbData = {
      ...analysisData,
      value_propositions: this.serializeJsonField(analysisData.value_propositions),
      target_audience: this.serializeJsonField(analysisData.target_audience),
      content_themes: this.serializeJsonField(analysisData.content_themes),
      technical_metadata: this.serializeJsonField(analysisData.technical_metadata)
    }

    const analysisId = await this.create(dbData)
    const analysis = await this.findById(analysisId)
    
    if (!analysis) {
      throw new Error('Failed to retrieve created website analysis')
    }

    return analysis
  }

  /**
   * Find analysis by session ID
   */
  async findBySessionId(sessionId: string): Promise<WebsiteAnalysis | null> {
    return this.findOneBy('session_id', sessionId)
  }

  /**
   * Find analyses by URL
   */
  async findByUrl(url: string): Promise<WebsiteAnalysis[]> {
    return this.findBy('url', url)
  }

  /**
   * Find recent analyses for a URL
   */
  async findRecentByUrl(url: string, limit: number = 5): Promise<WebsiteAnalysis[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE url = ?
        ORDER BY analysis_timestamp DESC
        LIMIT ?
      `
      const results = await query<RowDataPacket[]>(sql, [url, limit])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new Error(`Failed to find recent analyses by URL: ${error}`)
    }
  }

  /**
   * Find analyses by business model
   */
  async findByBusinessModel(businessModel: string): Promise<WebsiteAnalysis[]> {
    return this.findBy('business_model', businessModel)
  }

  /**
   * Update website analysis
   */
  async updateAnalysis(
    id: string,
    updates: Partial<CreateWebsiteAnalysisInput>
  ): Promise<WebsiteAnalysis | null> {
    const updateData: any = {}

    if (updates.business_model !== undefined) {
      updateData.business_model = updates.business_model
    }
    if (updates.value_propositions !== undefined) {
      updateData.value_propositions = this.serializeJsonField(updates.value_propositions)
    }
    if (updates.target_audience !== undefined) {
      updateData.target_audience = this.serializeJsonField(updates.target_audience)
    }
    if (updates.content_themes !== undefined) {
      updateData.content_themes = this.serializeJsonField(updates.content_themes)
    }
    if (updates.technical_metadata !== undefined) {
      updateData.technical_metadata = this.serializeJsonField(updates.technical_metadata)
    }

    const updated = await this.update(id, updateData)
    
    if (!updated) {
      return null
    }

    return this.findById(id)
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
      throw new Error(`Failed to delete old analyses: ${error}`)
    }
  }
}

// Export singleton instance
export const websiteAnalysisRepository = new WebsiteAnalysisRepository()
