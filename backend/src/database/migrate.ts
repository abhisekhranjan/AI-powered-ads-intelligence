import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool, query } from '../config/database.js'
import { logger } from '../config/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Migration tracking table
const MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`

// Get list of migration files
async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = join(__dirname, '../../migrations')
  try {
    const files = await readdir(migrationsDir)
    return files
      .filter((f) => f.endsWith('.sql'))
      .sort()
  } catch (error) {
    logger.warn('No migrations directory found, creating it...')
    return []
  }
}

// Get executed migrations
async function getExecutedMigrations(): Promise<string[]> {
  try {
    const results = await query<any[]>('SELECT name FROM migrations')
    return results.map((r) => r.name)
  } catch (error) {
    return []
  }
}

// Execute migration
async function executeMigration(filename: string): Promise<void> {
  const migrationsDir = join(__dirname, '../../migrations')
  const filepath = join(migrationsDir, filename)
  const sql = await readFile(filepath, 'utf-8')

  // Split by semicolon and execute each statement
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const statement of statements) {
    await query(statement)
  }

  // Record migration
  await query('INSERT INTO migrations (name) VALUES (?)', [filename])
  logger.info(`✓ Executed migration: ${filename}`)
}

// Run migrations
async function runMigrations() {
  try {
    logger.info('Starting database migrations...')

    // Create migrations table
    await query(MIGRATIONS_TABLE)

    // Get migration files and executed migrations
    const files = await getMigrationFiles()
    const executed = await getExecutedMigrations()

    // Find pending migrations
    const pending = files.filter((f) => !executed.includes(f))

    if (pending.length === 0) {
      logger.info('No pending migrations')
      return
    }

    logger.info(`Found ${pending.length} pending migration(s)`)

    // Execute pending migrations
    for (const file of pending) {
      await executeMigration(file)
    }

    logger.info('✓ All migrations completed successfully')
  } catch (error) {
    logger.error('Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { runMigrations }
