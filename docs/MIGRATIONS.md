# Drizzle Automatic Migrations

Your app now uses **Drizzle's automatic migration system**! 🎉

## How It Works

1. **Schema Changes**: When you modify `src/main/db/schema.ts`, run:
   ```bash
   npm run db:generate
   ```
   This creates migration files in the `drizzle/` folder.

2. **Automatic Application**: On app startup, migrations are automatically applied to the production database.

3. **Migration Tracking**: Drizzle keeps track of which migrations have been applied in a `__drizzle_migrations` table.

## Development Workflow

### Adding/Changing Tables

1. Edit your schema in `src/main/db/schema.ts`
2. Generate migration:
   ```bash
   npm rebuild better-sqlite3  # Build for Node.js
   npm run db:generate         # Generate migration SQL files
   npx electron-rebuild        # Build for Electron
   ```
3. Run the app - migrations apply automatically!

### Testing Fresh Database

To test with a clean database, delete the production DB:
- Windows: Delete `%APPDATA%/ledgerly/database.db`
- Then restart the app - migrations run automatically

## What Happens on Startup

```
Running database migrations...
Migrations folder: C:\...\out\main\drizzle
Database migrations completed successfully
Database initialized at: C:\Users\...\AppData\Roaming\ledgerly\database.db
```

## Files Involved

- **`drizzle/`**: Generated migration SQL files
- **`src/main/db/migrate.ts`**: Migration runner
- **`electron.vite.config.ts`**: Copies migrations to `out/main/drizzle/`
- **`electron-builder.yml`**: Packages migrations with the app

## Migration States

Drizzle automatically tracks migrations in `__drizzle_migrations` table:
- ✅ Already applied migrations are skipped
- 🆕 New migrations are applied automatically
- 🔄 Ensures database is always up-to-date

## Production Builds

When you build the app for distribution:
```bash
npm run build:win  # or build:mac, build:linux
```

The `drizzle/` folder is automatically included in the packaged app, and migrations run on first launch for each user!

## No More Manual SQL! 

✨ You now have a fully automatic, schema-driven migration system that:
- Generates migrations from your TypeScript schema
- Applies them automatically on app startup
- Tracks what's been applied
- Works in both development and production
- Is version controlled (commit the `drizzle/` folder)
