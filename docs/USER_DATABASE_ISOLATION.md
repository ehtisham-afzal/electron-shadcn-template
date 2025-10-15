# User Database Isolation

## Overview

This application now implements **user-specific database isolation** to ensure that each authenticated user has their own separate SQLite database. This prevents data leakage between different users on the same machine.

## How It Works

### 1. Separate Database Files

Instead of using a single `database.db` file for all users, the application now creates individual database files for each user:

```
userData/
└── databases/
    ├── user_<userId1>.db
    ├── user_<userId2>.db
    └── user_<userId3>.db
```

Each database file is named using the user's Supabase ID: `user_<supabaseId>.db`

### 2. Database Lifecycle

#### **On Login/Registration**
- When a user successfully logs in or registers, the application automatically:
  1. Closes any previously open database
  2. Creates or opens the database file for the authenticated user
  3. Runs migrations to ensure the schema is up-to-date
  4. Makes this database the active instance

#### **On Logout**
- When a user logs out, the application:
  1. Closes the current database connection
  2. Clears all database references
  3. Prevents any further database access until a new user logs in

### 3. Security Features

- **No Default Database**: The database is not initialized until a user is authenticated
- **Automatic Switching**: Database switches automatically when users change
- **Clean Separation**: Each user's data is stored in a completely separate file
- **Error Prevention**: Attempting to access the database without authentication throws an error

## Implementation Details

### Main Process (src/main/db/index.ts)

The database module now exports these functions:

- `initializeUserDatabase(userId)` - Creates/opens a database for a specific user
- `closeCurrentDatabase()` - Closes the active database connection
- `getDatabase()` - Returns the current database instance (throws if no user authenticated)
- `getSqliteInstance()` - Returns the raw SQLite instance (throws if no user authenticated)
- `getCurrentUserId()` - Returns the ID of the currently authenticated user

### IPC Communication

Three IPC handlers manage database lifecycle:

- `db:initializeUser` - Initialize database for a user (called on login)
- `db:closeUser` - Close the current user's database (called on logout)
- `db:getCurrentUser` - Get the currently active user ID

### Renderer Process Integration

The auth store (`src/renderer/src/stores/auth-store.ts`) automatically manages database initialization:

```typescript
// On successful login
const dbResult = await window.api.db.initializeUser(data.user.id)

// On logout
const dbResult = await window.api.db.closeUser()
```

## Using the Database

### Example: Saving User Preferences

```typescript
// In renderer process - use IPC to communicate with main process
ipcRenderer.invoke('db:savePreference', { theme: 'dark' })

// In main process - handler
ipcMain.handle('db:savePreference', async (_, preference) => {
  const db = getDatabase() // Will throw if no user authenticated
  return await db.insert(userPreferencesTable).values(preference)
})
```

## Migration from Shared Database

If you have existing data in the old shared `database.db` file, you'll need to:

1. Identify which data belongs to which user (using `supabaseId` field)
2. Export data for each user
3. Have users log in to create their individual databases
4. Import their specific data into their new database

## Benefits

✅ **Data Privacy**: Users cannot see each other's data, even on shared machines
✅ **Clean Logout**: No residual data access after logout
✅ **Multi-User Support**: Multiple users can use the same machine safely
✅ **Automatic Management**: Database switching is handled automatically
✅ **Type Safety**: TypeScript ensures correct API usage

## Important Notes

⚠️ **Backward Compatibility**: The old `db` export still exists but will throw errors if accessed without authentication. Update any code that tries to access the database before user login.

⚠️ **Database Location**: User databases are stored in the Electron `userData` directory under `databases/` folder.

⚠️ **Migrations**: Migrations run automatically when a user's database is first initialized or when they log in after an app update.

## Troubleshooting

### "No database initialized" Error

This means you're trying to access the database before a user has logged in. Ensure:
1. User authentication is complete
2. `initializeUserDatabase()` has been called
3. Any database operations happen after successful login

### Database File Not Found

The database file is created automatically on first login. If it's missing:
1. Check the `userData/databases/` directory exists
2. Verify user ID is valid
3. Check file system permissions

## Future Enhancements

Potential improvements:
- Database encryption for additional security
- Automatic database backup per user
- Database cleanup for users who haven't logged in for X days
- Database size limits per user
