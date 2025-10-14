import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { join } from 'path'
import { app } from 'electron'
import { existsSync } from 'fs'

/**
 * Run Drizzle migrations automatically on app startup
 * This ensures the database schema is always up to date
 */
export function runMigrations(db: Database.Database): void {
  console.log('Running database migrations...')

  try {
    // Create a Drizzle instance for migrations
    const drizzleDb = drizzle(db)

    // Determine migrations folder path
    // In development: out/main/drizzle (copied by vite plugin)
    // In production: resources/drizzle (packaged by electron-builder)
    let migrationsFolder = join(__dirname, 'drizzle')
    
    if (!existsSync(migrationsFolder)) {
      // Try production path
      migrationsFolder = join(process.resourcesPath, 'drizzle')
    }
    
    if (!existsSync(migrationsFolder)) {
      // Fallback to app path
      migrationsFolder = join(app.getAppPath(), 'drizzle')
    }

    console.log('Migrations folder:', migrationsFolder)

    // Run migrations
    migrate(drizzleDb, { migrationsFolder })

    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  }
}
