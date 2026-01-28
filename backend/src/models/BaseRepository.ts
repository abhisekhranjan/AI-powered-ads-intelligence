/**
 * Base Repository class providing common database operations
 * All model repositories extend this class for consistent data access patterns
 */

import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise'
import { query, transaction } from '../config/database.js'
import { DatabaseError, PaginationParams, PaginatedResult } from './types.js'

export abstract class BaseRepository<T> {
  constructor(protected tableName: string) {}

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`
      const results = await query<RowDataPacket[]>(sql, [id])
      
      if (results.length === 0) {
        return null
      }
      
      return this.mapRowToModel(results[0])
    } catch (error) {
      throw new DatabaseError(
        `Failed to find ${this.tableName} by id: ${id}`,
        'FIND_BY_ID_ERROR',
        error
      )
    }
  }

  /**
   * Find all records with optional pagination
   */
  async findAll(pagination?: PaginationParams): Promise<T[]> {
    try {
      let sql = `SELECT * FROM ${this.tableName}`
      const params: any[] = []

      if (pagination) {
        sql += ' LIMIT ? OFFSET ?'
        params.push(pagination.limit, pagination.offset)
      }

      const results = await query<RowDataPacket[]>(sql, params)
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new DatabaseError(
        `Failed to find all ${this.tableName}`,
        'FIND_ALL_ERROR',
        error
      )
    }
  }

  /**
   * Find records with pagination and total count
   */
  async findPaginated(pagination: PaginationParams): Promise<PaginatedResult<T>> {
    try {
      // Get total count
      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName}`
      const countResults = await query<RowDataPacket[]>(countSql)
      const total = countResults[0].total

      // Get paginated data
      const data = await this.findAll(pagination)

      return {
        data,
        total,
        limit: pagination.limit,
        offset: pagination.offset,
        has_more: pagination.offset + pagination.limit < total
      }
    } catch (error) {
      throw new DatabaseError(
        `Failed to find paginated ${this.tableName}`,
        'FIND_PAGINATED_ERROR',
        error
      )
    }
  }

  /**
   * Find records by a specific field value
   */
  async findBy(field: string, value: any): Promise<T[]> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE ${field} = ?`
      const results = await query<RowDataPacket[]>(sql, [value])
      return results.map(row => this.mapRowToModel(row))
    } catch (error) {
      throw new DatabaseError(
        `Failed to find ${this.tableName} by ${field}`,
        'FIND_BY_ERROR',
        error
      )
    }
  }

  /**
   * Find one record by a specific field value
   */
  async findOneBy(field: string, value: any): Promise<T | null> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE ${field} = ? LIMIT 1`
      const results = await query<RowDataPacket[]>(sql, [value])
      
      if (results.length === 0) {
        return null
      }
      
      return this.mapRowToModel(results[0])
    } catch (error) {
      throw new DatabaseError(
        `Failed to find one ${this.tableName} by ${field}`,
        'FIND_ONE_BY_ERROR',
        error
      )
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<string> {
    try {
      const fields = Object.keys(data)
      const values = Object.values(data)
      const placeholders = fields.map(() => '?').join(', ')

      const sql = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
      `

      const result = await query<ResultSetHeader>(sql, values)
      
      // For tables with auto-increment, return insertId
      // For tables with UUID, return the id from data
      return (data as any).id || result.insertId.toString()
    } catch (error) {
      throw new DatabaseError(
        `Failed to create ${this.tableName}`,
        'CREATE_ERROR',
        error
      )
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<boolean> {
    try {
      const fields = Object.keys(data)
      const values = Object.values(data)
      const setClause = fields.map(field => `${field} = ?`).join(', ')

      const sql = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE id = ?
      `

      const result = await query<ResultSetHeader>(sql, [...values, id])
      return result.affectedRows > 0
    } catch (error) {
      throw new DatabaseError(
        `Failed to update ${this.tableName} with id: ${id}`,
        'UPDATE_ERROR',
        error
      )
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`
      const result = await query<ResultSetHeader>(sql, [id])
      return result.affectedRows > 0
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete ${this.tableName} with id: ${id}`,
        'DELETE_ERROR',
        error
      )
    }
  }

  /**
   * Check if a record exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const sql = `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`
      const results = await query<RowDataPacket[]>(sql, [id])
      return results.length > 0
    } catch (error) {
      throw new DatabaseError(
        `Failed to check existence of ${this.tableName} with id: ${id}`,
        'EXISTS_ERROR',
        error
      )
    }
  }

  /**
   * Count total records
   */
  async count(): Promise<number> {
    try {
      const sql = `SELECT COUNT(*) as total FROM ${this.tableName}`
      const results = await query<RowDataPacket[]>(sql)
      return results[0].total
    } catch (error) {
      throw new DatabaseError(
        `Failed to count ${this.tableName}`,
        'COUNT_ERROR',
        error
      )
    }
  }

  /**
   * Execute a custom query within a transaction
   */
  protected async executeInTransaction<R>(
    callback: (connection: PoolConnection) => Promise<R>
  ): Promise<R> {
    return transaction(callback)
  }

  /**
   * Map database row to model object
   * Must be implemented by child classes
   */
  protected abstract mapRowToModel(row: RowDataPacket): T

  /**
   * Parse JSON fields from database
   */
  protected parseJsonField<T>(value: any): T | null {
    if (value === null || value === undefined) {
      return null
    }
    
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    
    return value as T
  }

  /**
   * Serialize JSON fields for database
   */
  protected serializeJsonField(value: any): string | null {
    if (value === null || value === undefined) {
      return null
    }
    
    if (typeof value === 'string') {
      return value
    }
    
    return JSON.stringify(value)
  }
}
