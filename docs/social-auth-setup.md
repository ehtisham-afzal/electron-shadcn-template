# Social Authentication Setup Guide

This guide explains how to implement the GitHub and Facebook OAuth buttons that are already in your UI.

## Current State

The sign-in and sign-up forms have these social auth buttons:
- GitHub
- Facebook

They are currently disabled. Here's how to enable them.

## Step 1: Enable Providers in Supabase

### GitHub OAuth

1. **Create GitHub OAuth App**:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in:
     - Application name: Your App Name
     - Homepage URL: `http://localhost` (dev) or your production URL
     - Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Save and copy the **Client ID** and **Client Secret**

2. **Configure in Supabase**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Find GitHub and enable it
   - Paste Client ID and Client Secret
   - Save

### Facebook OAuth

1. **Create Facebook App**:
   - Go to https://developers.facebook.com/apps
   - Create a new app
   - Add Facebook Login product
   - In Settings → Basic, copy **App ID** and **App Secret**
   - In Facebook Login → Settings, add redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

2. **Configure in Supabase**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Find Facebook and enable it
   - Paste App ID and App Secret
   - Save

## Step 2: Update Auth Forms

### Sign-In Form

Update `src/renderer/src/features/auth/sign-in/components/user-auth-form.tsx`:

```tsx
// Add these functions before the return statement

async function handleGitHubSignIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
    },
  })

  if (error) {
    toast.error('GitHub sign-in failed')
  }
}

async function handleFacebookSignIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin,
    },
  })

  if (error) {
    toast.error('Facebook sign-in failed')
  }
}

// Update the button onClick handlers:
<Button 
  variant='outline' 
  type='button' 
  disabled={isLoading}
  onClick={handleGitHubSignIn}
>
  <IconGithub className='h-4 w-4' /> GitHub
</Button>

<Button 
  variant='outline' 
  type='button' 
  disabled={isLoading}
  onClick={handleFacebookSignIn}
>
  <IconFacebook className='h-4 w-4' /> Facebook
</Button>
```

### Sign-Up Form

Same updates for `src/renderer/src/features/auth/sign-up/components/sign-up-form.tsx`

## Step 3: Handle OAuth Redirects (Electron-Specific)

Since this is an Electron app, OAuth redirects are tricky. You have two options:

### Option A: External Browser (Simpler)

Let OAuth open in the system browser, then handle the callback:

```typescript
// In auth store or auth form
async function signInWithOAuth(provider: 'github' | 'facebook') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      skipBrowserRedirect: true,
    },
  })

  if (data?.url) {
    // Open in system browser
    await window.api.openExternal(data.url)
  }
}
```

Then set up a custom protocol handler in your Electron app to receive the callback.

### Option B: In-App Browser Window

Create a BrowserWindow for OAuth:

```typescript
// In main process (src/main/index.ts)
import { BrowserWindow, shell } from 'electron'

ipcMain.handle('auth:oauth', async (event, url: string) => {
  const authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  authWindow.loadURL(url)

  // Listen for redirect
  authWindow.webContents.on('will-redirect', (event, redirectUrl) => {
    if (redirectUrl.includes('access_token')) {
      // Extract token and send to renderer
      authWindow.close()
      event.sender.send('auth:oauth:success', redirectUrl)
    }
  })
})
```

## Step 4: Deep Linking Setup (Recommended for Production)

For a native Electron experience:

### 1. Register Custom Protocol

In `electron-builder.yml`:

```yaml
protocols:
  - name: YourApp
    schemes:
      - yourapp
```

### 2. Handle Protocol in Main Process

```typescript
// In src/main/index.ts
import { app } from 'electron'

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('yourapp', process.execPath, [
      path.resolve(process.argv[1]),
    ])
  }
} else {
  app.setAsDefaultProtocolClient('yourapp')
}

// Handle the protocol
app.on('open-url', (event, url) => {
  event.preventDefault()
  // Handle the OAuth callback URL
  // Extract tokens and pass to renderer
})
```

### 3. Configure Supabase Redirect

In Supabase → Authentication → URL Configuration:
- Add redirect URL: `yourapp://auth/callback`

## Step 5: Update Supabase Client Config

Add OAuth redirect handling:

```typescript
// In src/renderer/src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Change to true for OAuth
  },
})
```

## Testing OAuth

1. **Development**:
   - Use `http://localhost:5173` or your dev URL
   - OAuth will work in the browser window
   - For Electron, you may need to handle the redirect manually

2. **Production**:
   - Set up custom protocol
   - Test deep linking
   - Ensure OAuth providers accept your production URL

## Alternative: Skip Social Auth

If OAuth is too complex for your use case:

1. Remove the social auth buttons from your forms
2. Focus on email/password authentication
3. Add social auth later when needed

To remove:

```tsx
// In user-auth-form.tsx and sign-up-form.tsx
// Delete the "Or continue with" section and the GitHub/Facebook buttons
```

## Security Considerations

1. **Never expose client secrets** in your Electron app code
2. **Use Supabase's OAuth flow** - it handles tokens securely
3. **Validate redirects** - ensure they come from Supabase
4. **Test thoroughly** - OAuth in Electron has edge cases

## Resources

- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login)
- [Electron Deep Linking](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)
- [Electron OAuth Guide](https://www.electronjs.org/docs/latest/tutorial/oauth)
