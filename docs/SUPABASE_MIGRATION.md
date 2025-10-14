# Supabase Authentication Migration Guide

This document outlines the migration from local authentication (bcryptjs + JWT + IPC) to Supabase managed authentication.

## ✅ What's Been Completed

### 1. Supabase Client Setup
- **File**: `src/renderer/src/lib/supabase.ts`
- Configured with localStorage for session persistence
- Auto token refresh enabled
- Electron-compatible settings (detectSessionInUrl: false)

### 2. Auth Store Refactored
- **File**: `src/renderer/src/stores/auth-store.ts`
- All methods now use Supabase instead of IPC:
  - `login()` - Email/password authentication
  - `register()` - User registration
  - `logout()` - Sign out
  - `checkAuth()` - Session verification
  - `sendPasswordReset()` - Password recovery
  - `updatePassword()` - Password update
  - `verifyOtp()` - OTP verification
  - `resendOtp()` - Resend OTP

### 3. Auth State Listener
- **File**: `src/renderer/src/routes/__root.tsx`
- Automatically syncs auth state changes
- Handles token refresh
- Updates user session in store

### 4. Protected Routes Updated
- **File**: `src/renderer/src/routes/_authenticated/route.tsx`
- Now checks Supabase session instead of IPC
- Redirects to sign-in if no valid session

### 5. Authentication Forms
- **Sign In**: `src/renderer/src/features/auth/sign-in/components/user-auth-form.tsx` ✅
- **Sign Up**: `src/renderer/src/features/auth/sign-up/components/sign-up-form.tsx` ✅
- **Forgot Password**: `src/renderer/src/features/auth/forgot-password/components/forgot-password-form.tsx` ✅
- **OTP Verification**: `src/renderer/src/features/auth/otp/components/otp-form.tsx` ✅

All forms are connected to the Supabase auth store.

## 🔧 Configuration Required

### Supabase Project Setup

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Create a new project** (or use existing)
3. **Get your credentials**:
   - Go to Settings → API
   - Copy `Project URL`
   - Copy `anon/public` key

4. **Configure Email Authentication**:
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates (optional)
   - Set up SMTP for production (optional)

5. **Update Environment Variables**:
   Your `.env` file already has the credentials:
   ```env
   VITE_SUPABASE_URL=https://sljzblxetpckzuxyrery.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Email Verification Settings

By default, Supabase requires email verification for new signups. You can:

**Option 1: Disable Email Verification (Development)**
- Go to Authentication → Settings
- Uncheck "Enable email confirmations"

**Option 2: Handle Email Confirmation (Production)**
- Keep email confirmation enabled
- Users will receive a confirmation email
- The `sign-up-form.tsx` already handles this flow
- After signup, users need to verify their email before logging in

## 🧪 Testing the Integration

### 1. Test Sign Up
```bash
npm run dev
```
- Navigate to `/sign-up`
- Enter name, email, and password
- Submit the form
- Check for success/error messages

### 2. Test Sign In
- Navigate to `/sign-in`
- Enter registered email and password
- Should redirect to dashboard after successful login

### 3. Test Forgot Password
- Navigate to `/forgot-password`
- Enter your email
- Check email for password reset link
- Note: Reset link will redirect to your Supabase site URL by default

### 4. Test Protected Routes
- Sign out
- Try to access `/` or any `/_authenticated` route
- Should redirect to `/sign-in`

## 📝 Next Steps

### 1. Test Authentication Flow (Priority: High)
Run through all auth flows to ensure everything works:
- [ ] Sign up with new user
- [ ] Verify email (if enabled)
- [ ] Sign in
- [ ] Access protected routes
- [ ] Sign out
- [ ] Forgot password flow
- [ ] OTP verification (if applicable)

### 2. Configure Password Reset Redirect
Update Supabase to redirect password reset to your app:
- Go to Authentication → URL Configuration
- Set "Site URL" to your app's URL (e.g., `http://localhost:5173` for dev)
- For Electron, you may need to handle deep linking or use a web page that communicates back to the app

### 3. Clean Up Old Auth System (After Testing)
Once Supabase auth is working, remove deprecated code:

**Files to Remove**:
- `src/main/services/auth.service.ts`
- IPC handlers in `src/main/index.ts` (auth-related)
- Auth API from `src/preload/index.ts` and `src/preload/index.d.ts`

**Database Tables to Consider**:
- `sessions_table` - No longer needed (Supabase handles sessions)
- `users_table` - You can keep this for app-specific user data, or migrate to Supabase's auth.users

### 4. Handle Social Auth (Optional)
The UI has GitHub and Facebook buttons. To enable:
- Go to Supabase → Authentication → Providers
- Enable GitHub/Facebook/etc.
- Get OAuth credentials from each provider
- Update the auth forms to use `supabase.auth.signInWithOAuth()`

### 5. Implement Deep Linking for Email Links (Electron-Specific)
For email verification and password reset links to work in Electron:
- Set up deep link handling in your Electron main process
- Register a custom protocol (e.g., `yourapp://`)
- Configure Supabase redirect URLs to use your custom protocol

## 🏗️ Architecture

### Local-First Approach
- **Authentication**: Managed by Supabase (cloud)
- **User Data**: Stored locally in SQLite with Drizzle ORM
- **Session Persistence**: localStorage in renderer process

### Data Flow
```
User Action → Auth Form → Auth Store (Zustand) → Supabase Client → Supabase Cloud
                                ↓
                        Update Local State
                                ↓
                    Auth State Listener (Root Component)
                                ↓
                        Sync Across All Components
```

## 🔒 Security Notes

1. **Anon Key**: The `VITE_SUPABASE_ANON_KEY` is safe to expose in your app (it's for client-side use)
2. **Row Level Security**: Consider enabling RLS on any Supabase tables you create
3. **Password Requirements**: Supabase enforces minimum password length (6 chars by default)
4. **Token Refresh**: Automatically handled by Supabase client
5. **Session Storage**: Uses localStorage (persists across app restarts)

## 🐛 Troubleshooting

### "User already registered" Error
- Supabase doesn't allow duplicate emails
- User needs to sign in instead or use password reset

### Email Not Sending
- Check Supabase email settings
- In development, check the Supabase dashboard → Authentication → Users for the verification link
- For production, configure SMTP in Supabase

### Session Not Persisting
- Check browser localStorage (DevTools → Application → Local Storage)
- Ensure `persistSession: true` in supabase.ts

### Auth State Not Updating
- Verify the auth state listener is set up in `__root.tsx`
- Check browser console for errors
- Ensure Supabase client is initialized before any auth operations

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Deep Linking in Electron](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)

## 🎯 Summary

Your Electron app now uses Supabase for authentication, providing:
- ✅ Email/password authentication
- ✅ Password reset flow
- ✅ OTP verification
- ✅ Session management
- ✅ Auto token refresh
- ✅ Email verification (configurable)
- ✅ Protected routes
- ✅ Local-first architecture (auth in cloud, data local)

The old IPC-based auth system is still present but not used. Test the Supabase integration thoroughly before removing the old code.
