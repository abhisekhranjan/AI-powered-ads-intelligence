/**
 * Database Query Helper Utilities
 * Provides common query building and execution patterns
 */

import { RowDataPacket } from 'mysql2/promise'
import { query } from '../config/database.js'
import { PaginationParams, PaginatedResult } from './types.js'

// ============================================================================
// Query Builder Helpers
// ============================================================================

/**
 * Build WHERE clause from conditions object
 */
export function buildWhereClause(
  conditions: Record<string, any>
): { clause: string; values: any[] } {
  const keys = Object.keys(conditions).filter(
    key => conditions[key] !== undefined && conditions[key] !== null
  )

  if (keys.length === 0) {
    return { clause: '', values: [] }
  }

  const clause = keys.map(key => `${key} = ?`).join(' AND ')
  const values = keys.map(key => conditions[key])

  return { clause: `WHERE ${clause}`, values }
}

/**
 * Build ORDER BY clause
 */
export function buildOrderByClause(
  orderBy: string | string[],
  direction: 'ASC' | 'DESC' = 'DESC'
): string {
  if (Array.isArray(orderBy)) {
    return `ORDER BY ${orderBy.map(field => `${field} ${direction}`).join(', ')}`
  }
  return `ORDER BY ${orderBy} ${direction}`
}

/**
 * Build LIMIT and OFFSET clause
 */
export function buildPaginationClause(pagination?: PaginationParams): {
  clause: string
  values: number[]
} {
  if (!pagination) {
    return { clause: '', values: [] }
  }

  return {
    clause: 'LIMIT ? OFFSET ?',
    values: [pagination.limit, pagination.offset]
  }
}

// ============================================================================
// Common Query Patterns
// ============================================================================

/**
 * Execute a SELECT query with conditions
 */
export async function selectWhere<T extends RowDataPacket>(
  tableName: string,
  conditions: Record<string, any>,
  orderBy?: string,
  pagination?: PaginationParams
): Promise<T[]> {
  const { clause: whereClause, values: whereValues } = buildWhereClause(conditions)
  const orderClause = orderBy ? buildOrderByClause(orderBy) : ''
  const { clause: paginationClause, values: paginationValues } =
    buildPaginationClause(pagination)

  const sql = `
    SELECT * FROM ${tableName}
    ${whereClause}
    ${orderClause}
    ${paginationClause}
  `.trim()

  const values = [...whereValues, ...paginationValues]
  return query<T[]>(sql, values)
}

/**
 * Execute a COUNT query with conditions
 */
export async function countWhere(
  tableName: string,
  conditions: Record<string, any>
): Promise<number> {
  const { clause: whereClause, values } = buildWhereClause(conditions)

  const sql = `
    SELECT COUNT(*) as total FROM ${tableName}
    ${whereClause}
  `.trim()

  const results = await query<RowDataPacket[]>(sql, values)
  return results[0]?.total || 0
}

/**
 * Execute a paginated query with total count
 */
export async function selectPaginated<T extends RowDataPacket>(
  tableName: string,
  conditions: Record<string, any>,
  pagination: PaginationParams,
  orderBy?: string
): Promise<PaginatedResult<T>> {
  // Get total count
  const total = await countWhere(tableName, conditions)

  // Get paginated data
  const data = await selectWhere<T>(tableName, conditions, orderBy, pagination)

  return {
    data,
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    has_more: pagination.offset + pagination.limit < total
  }
}

/**
 * Execute an UPDATE query with conditions
 */
export async function updateWhere(
  tableName: string,
  updates: Record<string, any>,
  conditions: Record<string, any>
): Promise<number> {
  const updateKeys = Object.keys(updates).filter(
    key => updates[key] !== undefined
  )
  const { clause: whereClause, values: whereValues } = buildWhereClause(conditions)

  if (updateKeys.length === 0) {
    return 0
  }

  const setClause = updateKeys.map(key => `${key} = ?`).join(', ')
  const updateValues = updateKeys.map(key => updates[key])

  const sql = `
    UPDATE ${tableName}
    SET ${setClause}
    ${whereClause}
  `.trim()

  const result = await query<any>(sql, [...updateValues, ...whereValues])
  return result.affectedRows || 0
}

/**
 * Execute a DELETE query with conditions
 */
export async function deleteWhere(
  tableName: string,
  conditions: Record<string, any>
): Promise<number> {
  const { clause: whereClause, values } = buildWhereClause(conditions)

  if (!whereClause) {
    throw new Error('DELETE without WHERE clause is not allowed')
  }

  const sql = `
    DELETE FROM ${tableName}
    ${whereClause}
  `.trim()

  const result = await query<any>(sql, values)
  return result.affectedRows || 0
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Execute a batch INSERT operation
 */
export async function batchInsert<T extends Record<string, any>>(
  tableName: string,
  records: T[]
): Promise<number> {
  if (records.length === 0) {
    return 0
  }

  const fields = Object.keys(records[0])
  const placeholders = records
    .map(() => `(${fields.map(() => '?').join(', ')})`)
    .join(', ')

  const sql = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES ${placeholders}
  `

  const values = records.flatMap(record => fields.map(field => record[field]))

  const result = await query<any>(sql, values)
  return result.affectedRows || 0
}

/**
 * Execute a batch UPDATE operation
 */
export async function batchUpdate<T extends Record<string, any>>(
  tableName: string,
  records: T[],
  idField: string = 'id'
): Promise<number> {
  if (records.length === 0) {
    return 0
  }

  let totalAffected = 0

  for (const record of records) {
    const id = record[idField]
    const updates = { ...record }
    delete updates[idField]

    const affected = await updateWhere(tableName, updates, { [idField]: id })
    totalAffected += affected
  }

  return totalAffected
}

// ============================================================================
// Search Helpers
// ============================================================================

/**
 * Execute a LIKE search query
 */
export async function searchLike<T extends RowDataPacket>(
  tableName: string,
  field: string,
  searchTerm: string,
  pagination?: PaginationParams
): Promise<T[]> {
  const { clause: paginationClause, values: paginationValues } =
    buildPaginationClause(pagination)

  const sql = `
    SELECT * FROM ${tableName}
    WHERE ${field} LIKE ?
    ${paginationClause}
  `.trim()

  const values = [`%${searchTerm}%`, ...paginationValues]
  return query<T[]>(sql, values)
}

/**
 * Execute a full-text search query
 */
export async function searchFullText<T extends RowDataPacket>(
  tableName: string,
  fields: string[],
  searchTerm: string,
  pagination?: PaginationParams
): Promise<T[]> {
  const { clause: paginationClause, values: paginationValues } =
    buildPaginationClause(pagination)

  const matchClause = `MATCH(${fields.join(', ')}) AGAINST(? IN NATURAL LANGUAGE MODE)`

  const sql = `
    SELECT * FROM ${tableName}
    WHERE ${matchClause}
    ${paginationClause}
  `.trim()

  const values = [searchTerm, ...paginationValues]
  return query<T[]>(sql, values)
}

// ============================================================================
// Aggregation Helpers
// ============================================================================

/**
 * Execute a GROUP BY query with aggregation
 */
export async function groupByWithCount(
  tableName: string,
  groupByField: string,
  conditions?: Record<string, any>
): Promise<Array<RowDataPacket & { count: number }>> {
  const { clause: whereClause, values } = conditions
    ? buildWhereClause(conditions)
    : { clause: '', values: [] }

  const sql = `
    SELECT ${groupByField}, COUNT(*) as count
    FROM ${tableName}
    ${whereClause}
    GROUP BY ${groupByField}
    ORDER BY count DESC
  `.trim()

  return query<Array<RowDataPacket & { count: number }>>(sql, values)
}

/**
 * Execute a SUM aggregation query
 */
export async function sumField(
  tableName: string,
  field: string,
  conditions?: Record<string, any>
): Promise<number> {
  const { clause: whereClause, values } = conditions
    ? buildWhereClause(conditions)
    : { clause: '', values: [] }

  const sql = `
    SELECT SUM(${field}) as total
    FROM ${tableName}
    ${whereClause}
  `.trim()

  const results = await query<RowDataPacket[]>(sql, values)
  return results[0]?.total || 0
}

/**
 * Execute an AVG aggregation query
 */
export async function avgField(
  tableName: string,
  field: string,
  conditions?: Record<string, any>
): Promise<number> {
  const { clause: whereClause, values } = conditions
    ? buildWhereClause(conditions)
    : { clause: '', values: [] }

  const sql = `
    SELECT AVG(${field}) as average
    FROM ${tableName}
    ${whereClause}
  `.trim()

  const results = await query<RowDataPacket[]>(sql, values)
  return results[0]?.average || 0
}

// ============================================================================
// Date Range Helpers
// ============================================================================

/**
 * Query records within a date range
 */
export async function selectDateRange<T extends RowDataPacket>(
  tableName: string,
  dateField: string,
  startDate: Date,
  endDate: Date,
  pagination?: PaginationParams
): Promise<T[]> {
  const { clause: paginationClause, values: paginationValues } =
    buildPaginationClause(pagination)

  const sql = `
    SELECT * FROM ${tableName}
    WHERE ${dateField} BETWEEN ? AND ?
    ORDER BY ${dateField} DESC
    ${paginationClause}
  `.trim()

  const values = [startDate, endDate, ...paginationValues]
  return query<T[]>(sql, values)
}

/**
 * Count records within a date range
 */
export async function countDateRange(
  tableName: string,
  dateField: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const sql = `
    SELECT COUNT(*) as total
    FROM ${tableName}
    WHERE ${dateField} BETWEEN ? AND ?
  `

  const results = await query<RowDataPacket[]>(sql, [startDate, endDate])
  return results[0]?.total || 0
}

// ============================================================================
// Existence Checks
// ============================================================================

/**
 * Check if a record exists with given conditions
 */
export async function exists(
  tableName: string,
  conditions: Record<string, any>
): Promise<boolean> {
  const count = await countWhere(tableName, conditions)
  return count > 0
}

/**
 * Check if a value is unique in a field
 */
export async function isUnique(
  tableName: string,
  field: string,
  value: any,
  excludeId?: string
): Promise<boolean> {
  let sql = `
    SELECT COUNT(*) as total
    FROM ${tableName}
    WHERE ${field} = ?
  `
  const values: any[] = [value]

  if (excludeId) {
    sql += ' AND id != ?'
    values.push(excludeId)
  }

  const results = await query<RowDataPacket[]>(sql, values)
  return results[0]?.total === 0
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Execute multiple queries in a transaction
 * Note: This is a simplified version. For complex transactions,
 * use the transaction() function from database.ts
 */
export async function executeInTransaction(
  queries: Array<{ sql: string; values: any[] }>
): Promise<void> {
  const { transaction } = await import('../config/database.js')

  await transaction(async connection => {
    for (const { sql, values } of queries) {
      await connection.execute(sql, values)
    }
  })
}
