# electron-app

An Electron application with React, TypeScript, and Supabase Authentication

## Features

- 🔐 **Supabase Authentication** - Email/password auth, OAuth, password reset, OTP verification
- 💾 **Local-First Database** - SQLite with Drizzle ORM for app data
- ⚛️ **Modern React** - TanStack Router, React Query, Zustand state management
- 🎨 **Beautiful UI** - Shadcn UI components with Tailwind CSS
- 📱 **Responsive Design** - Works on desktop with adaptive layouts
- 🔄 **Auto Migrations** - Drizzle migrations run automatically on app start

## Tech Stack

- **Frontend**: React 18, TypeScript, TanStack Router
- **UI**: Shadcn UI, Tailwind CSS, Radix UI
- **Authentication**: Supabase Auth
- **Database**: SQLite (better-sqlite3) with Drizzle ORM
- **State Management**: Zustand, React Query
- **Build**: Electron Vite, Electron Builder
- **Forms**: React Hook Form, Zod validation

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project ([Create one here](https://supabase.com))

### Install

```bash
$ npm install
```

### Environment Configuration

1. Copy the example environment file:
```bash
$ cp .env.example .env
```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the `Project URL` and `anon/public` key

3. Update `.env` with your credentials:
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

The database will be automatically initialized when you first run the app. Migrations are applied on startup.

To manage the database manually:

```bash
# Generate new migration after schema changes
$ npm run db:generate

# Apply migrations manually (optional - auto on app start)
$ npm run db:migrate

# Push schema changes directly (dev only)
$ npm run db:push

# Open Drizzle Studio to view/edit data
$ npm run db:studio
```

### Development

```bash
$ npm run dev
```

The app will open automatically. The database will be created at:
- Windows: `%APPDATA%/ledgerly/database.db`
- macOS: `~/Library/Application Support/ledgerly/database.db`
- Linux: `~/.config/ledgerly/database.db`

### Build

```bash
# For Windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Authentication Setup

This app uses Supabase for authentication. See [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) for detailed setup instructions.

### Quick Start

1. **Configure Supabase**:
   - Enable Email provider in Supabase Dashboard → Authentication → Providers
   - (Optional) Disable email confirmation for development

2. **Test Authentication**:
   - Run the app with `npm run dev`
   - Navigate to `/sign-up` to create an account
   - Sign in at `/sign-in`

3. **Optional Features**:
   - Social OAuth (GitHub, Facebook) - See [docs/social-auth-setup.md](./docs/social-auth-setup.md)
   - Email verification
   - Password reset
   - OTP verification

## Project Structure

```
electron-app/
├── src/
│   ├── main/              # Electron main process
│   │   ├── db/            # Database setup and migrations
│   │   └── index.ts       # Main process entry
│   ├── preload/           # Preload scripts for IPC
│   └── renderer/          # React app
│       └── src/
│           ├── components/     # Reusable UI components
│           ├── features/       # Feature-based modules
│           │   ├── auth/       # Authentication pages
│           │   ├── dashboard/  # Dashboard
│           │   └── settings/   # Settings pages
│           ├── lib/            # Utilities and config
│           │   └── supabase.ts # Supabase client
│           ├── routes/         # TanStack Router routes
│           └── stores/         # Zustand stores
├── drizzle/               # Database migrations
├── resources/             # App icons and assets
├── .env                   # Environment variables (create from .env.example)
└── package.json
```

## Available Scripts

- `npm run dev` - Start development mode
- `npm run build:win` - Build for Windows
- `npm run build:mac` - Build for macOS  
- `npm run build:linux` - Build for Linux
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes directly
- `npm run db:studio` - Open Drizzle Studio

## Troubleshooting

### Native Module Errors (better-sqlite3)

If you see `NODE_MODULE_VERSION` errors:

```bash
# Rebuild for Node.js (for drizzle-kit)
$ npm rebuild better-sqlite3

# Rebuild for Electron (for the app)
$ npx electron-rebuild
```

### Authentication Issues

See [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) for detailed troubleshooting.

## Documentation

- [Supabase Migration Guide](./SUPABASE_MIGRATION.md) - Complete auth setup guide
- [Social Auth Setup](./docs/social-auth-setup.md) - GitHub/Facebook OAuth
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM documentation
- [Supabase Docs](https://supabase.com/docs) - Authentication reference

## License

MIT
