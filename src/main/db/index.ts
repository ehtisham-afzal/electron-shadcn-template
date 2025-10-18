import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'
import { runMigrations } from './migrate'
import { existsSync, mkdirSync } from 'fs'

// Single database instance
let db: ReturnType<typeof drizzle> | null = null
let sqliteInstance: Database.Database | null = null

/**
 * Initialize the application database
 * Creates a single database file for all users
 */
export function initializeDatabase(): void {
  // If database is already initialized, don't reinitialize
  if (db && sqliteInstance) {
    console.log('Database already initialized')
    return
  }

  // Get the user data directory for storing database
  const userDataPath = app.getPath('userData')
  const dbDirectory = join(userDataPath, 'database')

  // Ensure database directory exists
  if (!existsSync(dbDirectory)) {
    mkdirSync(dbDirectory, { recursive: true })
  }

  // Create database path
  const dbPath = join(dbDirectory, 'app.db')

  console.log(`Initializing database at: ${dbPath}`)

  // Create SQLite database instance
  sqliteInstance = new Database(dbPath)
  
  // Enable WAL mode for better concurrency and persistence
  sqliteInstance.pragma('journal_mode = WAL')
  sqliteInstance.pragma('synchronous = NORMAL')

  // Run migrations to ensure tables exist
  runMigrations(sqliteInstance)

  // Create Drizzle instance
  db = drizzle(sqliteInstance, { schema })

  console.log('Database initialized successfully')
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (sqliteInstance) {
    try {
      sqliteInstance.close()
      console.log('Database closed')
    } catch (error) {
      console.error('Error closing database:', error)
    }
  }
  db = null
  sqliteInstance = null
}

/**
 * Get the database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

/**
 * Get the SQLite instance
 */
export function getSqliteInstance(): Database.Database {
  if (!sqliteInstance) {
    throw new Error('Database not initialized')
  }
  return sqliteInstance
}
