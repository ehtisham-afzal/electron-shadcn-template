import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Example: App-specific user data table
// This stores additional user information beyond what Supabase auth provides
// Link to Supabase users via supabaseId
export const userPreferencesTable = sqliteTable('user_preferences', {
  id: int().primaryKey({ autoIncrement: true }),
  supabaseId: text('supabase_id').notNull().unique(), // Links to Supabase auth.users.id
  theme: text().notNull().default('system'), // light, dark, system
  language: text().notNull().default('en'),
  notifications: int('notifications', { mode: 'boolean' }).notNull().default(true),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
})

// Add more tables for your application data here
// For example: tasks, notes, projects, etc.
