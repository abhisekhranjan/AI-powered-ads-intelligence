/**
 * Analysis Cache Repository - Database access layer for analysis_cache table
 */

import { RowDataPacket } from 'mysql2/promise'
import { BaseRepository } from './BaseRepository.js'
import { AnalysisCache, CreateAnalysisCacheInput } from './types.js'
import { v4 as uuidv4 } from 'uuid'
import { query } from '../config/database.js'

export class AnalysisCacheRepository extends BaseRepository<AnalysisCache> {
  constructor() {
    super('analysis_cache')
  }

  /**
   * Map database row to AnalysisCache model
   */
  protected mapRowToModel(row: RowDataPacket): AnalysisCache {
    return {
      id: row.id,
      cache_key: row.cache_key,
      cache_data: this.parseJsonField(row.cache_data),
      expires_at: row.expires_at,
      created_at: row.created_at
    }
  }

  /**
   * Create a new cache entry
   */
  async createCache(input: CreateAnalysisCacheInput): Promise<AnalysisCache> {
    const cacheData: Partial<AnalysisCache> = {
      id: uuidv4(),
      cache_key: input.cache_key,
      cache_data: input.cache_data,
      expires_at: input.expires_at,
      created_at: new Date()
    }

    // Serialize JSON fields
    const dbData = {
      ...cacheData,
      cache_data: this.serializeJsonField(cacheData.cache_data)
    }

    const cacheId = await this.create(dbData)
    const cache = await this.findById(cacheId)
    
    if (!cache) {
      throw new Error('Failed to retrieve created cache entry')
    }

    return cache
  }

  /**
   * Find cache by key
   */
  async findByCacheKey(cacheKey: string): Promise<AnalysisCache | null> {
    const cache = await this.findOneBy('cache_key', cacheKey)
    
    // Check if cache is expired
    if (cache && new Date() > new Date(cache.expires_at)) {
      // Delete expired cache
      await this.delete(cache.id)
      return null
    }
    
    return cache
  }

  /**
   * Get cached data by key (returns only the data, not the full record)
   */
  async getCachedData<T = any>(cacheKey: string): Promise<T | null> {
    const cache = await this.findByCacheKey(cacheKey)
    return cache ? (cache.cache_data as T) : null
  }

  /**
   * Set cache data with TTL in seconds
   */
  async setCachedData(
    cacheKey: string,
    data: any,
    ttlSeconds: number
  ): Promise<AnalysisCache> {
    // Check if cache key already exists
    const existing = await this.findOneBy('cache_key', cacheKey)
    
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds)

    if (existing) {
      // Update existing cache
      await this.update(existing.id, {
        cache_data: this.serializeJsonField(data),
        expires_at: expiresAt
      } as any)
      
      const updated = await this.findById(existing.id)
      if (!updated) {
        throw new Error('Failed to retrieve updated cache')
      }
      return updated
    } else {
      // Create new cache entry
      return this.createCache({
        cache_key: cacheKey,
        cache_data: data,
        expires_at: expiresAt
      })
    }
  }

  /**
   * Delete cache by key
   */
  async deleteByCacheKey(cacheKey: string): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE cache_key = ?`
      const result = await query<any>(sql, [cacheKey])
      return result.affectedRows > 0
    } catch (error) {
      throw new Error(`Failed to delete cache by key: ${error}`)
    }
  }

  /**
   * Delete all expired cache entries
   */
  async deleteExpiredCache(): Promise<number> {
    try {
      const sql = `
        DELETE FROM ${this.tableName}
        WHERE expires_at < NOW()
      `
      const result = await query<any>(sql)
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to delete expired cache: ${error}`)
    }
  }

  /**
   * Count expired cache entries
   */
  async countExpiredCache(): Promise<number> {
    try {
      const sql = `
        SELECT COUNT(*) as total
        FROM ${this.tableName}
        WHERE expires_at < NOW()
      `
      const results = await query<RowDataPacket[]>(sql)
      return results[0].total
    } catch (error) {
      throw new Error(`Failed to count expired cache: ${error}`)
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAllCache(): Promise<number> {
    try {
      const sql = `DELETE FROM ${this.tableName}`
      const result = await query<any>(sql)
      return result.affectedRows || 0
    } catch (error) {
      throw new Error(`Failed to clear all cache: ${error}`)
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    total: number
    expired: number
    active: number
  }> {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN expires_at < NOW() THEN 1 ELSE 0 END) as expired,
          SUM(CASE WHEN expires_at >= NOW() THEN 1 ELSE 0 END) as active
        FROM ${this.tableName}
      `
      const results = await query<RowDataPacket[]>(sql)
      return {
        total: results[0].total || 0,
        expired: results[0].expired || 0,
        active: results[0].active || 0
      }
    } catch (error) {
      throw new Error(`Failed to get cache stats: ${error}`)
    }
  }
}

// Export singleton instance
export const analysisCacheRepository = new AnalysisCacheRepository()
