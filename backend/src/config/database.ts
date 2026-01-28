import mysql from 'mysql2/promise'
import { config } from './env.js'

// Database connection pool configuration
const poolConfig: mysql.PoolOptions = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}

// Create connection pool
export const pool = mysql.createPool(poolConfig)

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('✓ Database connection established successfully')
    return true
  } catch (error) {
    console.error('✗ Database connection failed:', error)
    return false
  }
}

// Execute query with connection from pool
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  const [results] = await pool.execute(sql, params)
  return results as T
}

// Execute transaction
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end()
  console.log('Database connection pool closed')
}
