/**
 * Export History Repository - Database access layer for export_history table
 */

import { RowDataPacket } from 'mysql2/promise'
import { BaseRepository } from './BaseRepository.js'
import { ExportHistory, CreateExportHistoryInput, ExportType } from './types.js'
import { v4 as uuidv4 } from 'uuid'
import { query } from '../config/database.js'

export class ExportHistoryRepository extends BaseRepository<ExportHistory> {
  constructor() {
    super('export_history')
  }

  /**
   * Map database row to ExportHistory model
   */
  protected mapRowToModel(row: RowDataPacket): ExportHistory {
    return {
      id: row.id,
      session_id: row.session_id,
      export_type: row.export_type,
      filename: row.filename,
      export_data: this.parseJsonField(row.export_data),
      created_at: row.created_at
    }
  }

  /**
   * Create a new export history record
   */
  async createExport(input: CreateExportHistoryInput): Promise<ExportHistory> {
    const exportData: Partial<ExportHistory> = {
      id: uuidv4(),
      session_id: input.session_id,
      export_type: input.export_type,
      filename: input.filename || null,
      export_data: input.export_data || null,
      created_at: new Date()
    }

    // Serialize JSON fields
    const dbData: any = {
      ...exportData,
      export_data: this.serializeJsonField(exportData.export_data)
    }

    const exportId = await this.create(dbData)
    const exportRecord = await this.findById(exportId)
    
    if (!exportRecord) {
      throw new Error('Failed to retrieve created export history')
    }

    return exportRecord
  }

  /**
   * Find exports by session ID
   */
  async findBySessionId(sessionId: string): Promise<ExportHistory[]> {
    return this.findBy('session_id', sessionId)
  }

  /**
   * Find exports by type
   */
  async findByExportType(exportType: ExportType): Promise<ExportHistory[]> {
    return this.findBy('export_type', exportType)
  }

  /**
   * Find exports by session and type
   */
  async findBySessionAndType(
    sessionId: string,
    exportType: ExportType
  ): Promise<ExportHistory[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE session_id = ? AND export_type = ?
        ORDER BY created_at DESC
      `
      const results = await query<RowDataPacket[]>(sql, [sessionId, exportType])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new Error(`Failed to find exports by session and type: ${error}`)
    }
  }

  /**
   * Find recent exports for a session
   */
  async findRecentBySessionId(
    sessionId: string,
    limit: number = 10
  ): Promise<ExportHistory[]> {
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
      throw new Error(`Failed to find recent exports: ${error}`)
    }
  }

  /**
   * Count exports by session
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
      throw new Error(`Failed to count exports: ${error}`)
    }
  }

  /**
   * Count exports by type
   */
  async countByExportType(exportType: ExportType): Promise<number> {
    try {
      const sql = `
        SELECT COUNT(*) as total
        FROM ${this.tableName}
        WHERE export_type = ?
      `
      const results = await query<RowDataPacket[]>(sql, [exportType])
      return results[0].total
    } catch (error) {
      throw new Error(`Failed to count exports by type: ${error}`)
    }
  }

  /**
   * Delete exports older than specified days
   */
  async deleteOldExports(daysOld: number = 90): Promise<number> {
    try {
      const sql = `
        DELETE FROM ${this.tableName}
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `
      const result = await query<any>(sql, [daysOld])
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete old exports: ${error}`)
    }
  }

  /**
   * Delete all exports for a session
   */
  async deleteBySessionId(sessionId: string): Promise<number> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE session_id = ?`
      const result = await query<any>(sql, [sessionId])
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete exports by session: ${error}`)
    }
  }
}

// Export singleton instance
export const exportHistoryRepository = new ExportHistoryRepository()
