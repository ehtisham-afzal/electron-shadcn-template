# Database Integration with Drizzle ORM

This project uses Drizzle ORM with better-sqlite3 for local SQLite database management.

## Structure

- `src/main/db/schema.ts` - Database schema definitions
- `src/main/db/index.ts` - Database connection and initialization
- `drizzle.config.ts` - Drizzle Kit configuration
- `drizzle/` - Migration files (generated)

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Apply pending migrations to the database
- `npm run db:push` - Push schema changes directly to database (for development)
- `npm run db:studio` - Open Drizzle Studio for visual database management

## Database Location

The SQLite database file is stored in the Electron app's userData directory:
- Windows: `%APPDATA%/ledgerly/database.db`
- macOS: `~/Library/Application Support/ledgerly/database.db`
- Linux: `~/.config/ledgerly/database.db`

## Quick Start

1. **Define your schema** in `src/main/db/schema.ts`

2. **Push schema to database** (for development):
   ```bash
   npm run db:push
   ```

3. **Or generate and apply migrations** (for production):
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## Usage Examples

### In Main Process (IPC Handlers)

```typescript
import { ipcMain } from 'electron'
import { db } from './db'
import { usersTable } from './db/schema'

// Get all users
ipcMain.handle('db:getUsers', async () => {
  return await db.select().from(usersTable)
})

// Create a user
ipcMain.handle('db:createUser', async (_, userData) => {
  return await db.insert(usersTable).values(userData).returning()
})

// Update a user
ipcMain.handle('db:updateUser', async (_, id, data) => {
  return await db.update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning()
})

// Delete a user
ipcMain.handle('db:deleteUser', async (_, id) => {
  return await db.delete(usersTable)
    .where(eq(usersTable.id, id))
})
```

### In Renderer Process (via IPC)

```typescript
// Assuming you've exposed IPC in preload
const users = await window.electron.ipcRenderer.invoke('db:getUsers')
const newUser = await window.electron.ipcRenderer.invoke('db:createUser', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

## Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle SQLite Guide](https://orm.drizzle.team/docs/get-started-sqlite)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
