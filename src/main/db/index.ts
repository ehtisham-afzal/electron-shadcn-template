import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'
import { runMigrations } from './migrate'
import { existsSync, mkdirSync } from 'fs'

// Store active database instances per user
let currentDb: ReturnType<typeof drizzle> | null = null
let currentSqlite: Database.Database | null = null
let currentUserId: string | null = null

/**
 * Initialize a database for a specific user
 * Creates a separate database file for each user based on their ID
 */
export function initializeUserDatabase(userId: string): void {
  // Close existing database if any
  closeCurrentDatabase()

  // Get the user data directory for storing databases
  const userDataPath = app.getPath('userData')
  const dbDirectory = join(userDataPath, 'databases')

  // Ensure database directory exists
  if (!existsSync(dbDirectory)) {
    mkdirSync(dbDirectory, { recursive: true })
  }

  // Create user-specific database path
  const dbPath = join(dbDirectory, `user_${userId}.db`)

  console.log(`Initializing database for user ${userId} at: ${dbPath}`)

  // Create SQLite database instance for this user
  currentSqlite = new Database(dbPath)

  // Run migrations to ensure tables exist
  runMigrations(currentSqlite)

  // Create Drizzle instance
  currentDb = drizzle(currentSqlite, { schema })
  currentUserId = userId

  console.log(`Database initialized for user: ${userId}`)
}

/**
 * Close the current database connection
 */
export function closeCurrentDatabase(): void {
  if (currentSqlite) {
    try {
      currentSqlite.close()
      console.log(`Database closed for user: ${currentUserId}`)
    } catch (error) {
      console.error('Error closing database:', error)
    }
  }
  currentDb = null
  currentSqlite = null
  currentUserId = null
}

/**
 * Get the current database instance
 * Throws an error if no user is authenticated
 */
export function getDatabase() {
  if (!currentDb) {
    throw new Error('No database initialized. User must be authenticated first.')
  }
  return currentDb
}

/**
 * Get the current SQLite instance
 */
export function getSqliteInstance(): Database.Database {
  if (!currentSqlite) {
    throw new Error('No database initialized. User must be authenticated first.')
  }
  return currentSqlite
}

/**
 * Get the current user ID
 */
export function getCurrentUserId(): string | null {
  return currentUserId
}

// For backward compatibility - these will throw errors if no user is authenticated
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (target, prop) => {
    const database = getDatabase()
    return database[prop as keyof typeof database]
  }
})

export const sqliteInstance: Database.Database = new Proxy({} as Database.Database, {
  get: (target, prop) => {
    const sqlite = getSqliteInstance()
    return sqlite[prop as keyof typeof sqlite]
  }
}) as Database.Database
