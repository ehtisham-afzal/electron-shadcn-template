import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'
import { runMigrations } from './migrate'

// Get the user data directory for storing the database
const userDataPath = app.getPath('userData')
const dbPath = join(userDataPath, 'database.db')

// Create SQLite database instance
const sqlite = new Database(dbPath)

// Run migrations to ensure tables exist
runMigrations(sqlite)

// Create Drizzle instance
export const db = drizzle(sqlite, { schema })

// Export the sqlite instance if needed for raw queries
export const sqliteInstance: Database.Database = sqlite

console.log(`Database initialized at: ${dbPath}`)
