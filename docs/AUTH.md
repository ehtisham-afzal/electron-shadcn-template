# Authentication System Documentation

## Overview

This Electron application now has a complete email/password authentication system with the following features:

- User registration with email and password
- Secure password hashing using bcryptjs
- JWT-based session management
- Persistent session storage using electron-store
- Protected routes and authentication state management

## Architecture

### Main Process (Node.js)

**Database Schema** (`src/main/db/schema.ts`):
- `usersTable`: Stores user information with hashed passwords
- `sessionsTable`: Manages active user sessions with tokens

**Auth Service** (`src/main/services/auth.service.ts`):
- `register()`: Create new user account
- `login()`: Authenticate user and create session
- `logout()`: End user session
- `verifyToken()`: Validate JWT tokens
- `isAuthenticated()`: Check authentication status
- Uses `electron-store` for persistent session storage

**IPC Handlers** (`src/main/index.ts`):
- `auth:register`: Register new user
- `auth:login`: Login user
- `auth:logout`: Logout user
- `auth:getCurrentUser`: Get current authenticated user
- `auth:verifyToken`: Verify authentication token
- `auth:isAuthenticated`: Check if user is authenticated

### Renderer Process

**Auth Store** (`src/renderer/src/stores/auth-store.ts`):
- Zustand store for managing authentication state
- Methods: `login()`, `register()`, `logout()`, `checkAuth()`
- Automatically syncs with main process via IPC

**Auth Components**:
- **Sign In Form** (`src/renderer/src/features/auth/sign-in/components/user-auth-form.tsx`)
  - Email and password login
  - Form validation with Zod
  - Error handling and toast notifications
  
- **Sign Up Form** (`src/renderer/src/features/auth/sign-up/components/sign-up-form.tsx`)
  - User registration with name, email, password
  - Password confirmation
  - Form validation

## Protected Routes

All routes under `/_authenticated` are automatically protected by authentication. Users must be logged in to access:

- Dashboard (`/`)
- Settings (`/settings/*`)
- Users (`/users`)
- Tasks (`/tasks`)
- Chats (`/chats`)
- Apps (`/apps`)
- Help Center (`/help-center`)

**How it works:**
- The `_authenticated/route.tsx` checks authentication status using `beforeLoad`
- Unauthenticated users are redirected to `/sign-in`
- The original URL is saved and users are redirected back after login
- Current user info is loaded into the auth store on route access

## Usage Examples

### In Renderer Components

```typescript
import { useAuthStore } from '@/stores/auth-store'

function MyComponent() {
  const { user, login, logout, isLoading } = useAuthStore()
  
  // Check if user is logged in
  if (user) {
    return <div>Welcome, {user.name}!</div>
  }
  
  // Login
  const handleLogin = async () => {
    const result = await login('user@example.com', 'password')
    if (result.success) {
      console.log('Logged in!')
    }
  }
  
  // Logout
  const handleLogout = async () => {
    await logout()
  }
}
```

### Check Authentication on App Start

Add this to your root component or layout:

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

function App() {
  const { checkAuth } = useAuthStore()
  
  useEffect(() => {
    // Check authentication status on mount
    checkAuth()
  }, [])
  
  return <YourAppContent />
}
```

### Protected Routes

```typescript
import { useAuthStore } from '@/stores/auth-store'
import { Navigate } from '@tanstack/react-router'

function ProtectedPage() {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/sign-in" />
  }
  
  return <div>Protected Content</div>
}
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs with 10 salt rounds
2. **JWT Tokens**: Sessions use signed JWT tokens with 7-day expiry
3. **Session Validation**: Tokens are validated against database sessions
4. **Automatic Cleanup**: Expired sessions are detected and removed
5. **Secure Storage**: Sessions persist in electron-store (encrypted userData directory)

## Database Management

### Automatic Drizzle Migrations ✨

The app uses **Drizzle's automatic migration system**! Migrations are generated from your schema and applied automatically on startup.

**Workflow:**
1. Edit `src/main/db/schema.ts`
2. Run `npm run db:generate` to create migration files
3. Restart the app - migrations apply automatically!

See [MIGRATIONS.md](./MIGRATIONS.md) for detailed documentation.

### Important Notes

- When running `db:push` or `db:generate`, better-sqlite3 needs to be built for Node.js
- When running the Electron app, better-sqlite3 needs to be built for Electron
- The `postinstall` script handles this automatically for new installs
- If you encounter module version errors:
  ```bash
  # For drizzle-kit commands
  npm rebuild better-sqlite3
  
  # For Electron app
  npx electron-rebuild
  ```

## Database Locations

- **Development DB** (for migrations): `./dev-database.db`
- **Production DB** (in Electron app):
  - Windows: `%APPDATA%/ledgerly/database.db`
  - macOS: `~/Library/Application Support/ledgerly/database.db`
  - Linux: `~/.config/ledgerly/database.db`

## Environment Variables

Create a `.env` file in the root directory (optional):

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
```

If not set, a default secret will be used (not recommended for production).

## First User Registration

The system allows open registration. To restrict this:

1. Modify `auth.service.ts` to check for existing users
2. Only allow registration if no users exist (first user becomes admin)
3. Require admin approval for subsequent registrations

## Troubleshooting

### "Module was compiled against different Node.js version"

This means better-sqlite3 needs to be rebuilt:
- For Electron: `npx electron-rebuild`
- For Node.js/drizzle-kit: `npm rebuild better-sqlite3`

### Sessions Not Persisting

Check that electron-store has write permissions to the userData directory.

### Login Always Fails

Ensure database tables are created by running `npm run db:push`

## Next Steps

- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Add OAuth providers (GitHub, Google, etc.)
- [ ] Add role-based access control
- [ ] Implement session timeout warnings
- [ ] Add multi-factor authentication
