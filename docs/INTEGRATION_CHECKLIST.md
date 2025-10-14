# Supabase Integration Checklist

## ✅ Completed Tasks

### Core Integration
- [x] Installed @supabase/supabase-js package
- [x] Created Supabase client configuration (`src/renderer/src/lib/supabase.ts`)
- [x] Refactored auth store to use Supabase (`src/renderer/src/stores/auth-store.ts`)
- [x] Added auth state listener in root component (`src/renderer/src/routes/__root.tsx`)
- [x] Updated protected routes to check Supabase session (`src/renderer/src/routes/_authenticated/route.tsx`)

### Authentication Forms
- [x] Sign-in form connected to Supabase (`src/renderer/src/features/auth/sign-in/components/user-auth-form.tsx`)
- [x] Sign-up form connected to Supabase (`src/renderer/src/features/auth/sign-up/components/sign-up-form.tsx`)
- [x] Forgot password flow implemented (`src/renderer/src/features/auth/forgot-password/components/forgot-password-form.tsx`)
- [x] OTP verification with resend functionality (`src/renderer/src/features/auth/otp/components/otp-form.tsx`)

### Code Quality
- [x] Fixed all TypeScript errors
- [x] Removed unused imports
- [x] All auth store methods implemented (login, register, logout, checkAuth, sendPasswordReset, updatePassword, verifyOtp, resendOtp)

### Documentation
- [x] Created comprehensive migration guide (`SUPABASE_MIGRATION.md`)
- [x] Created social auth setup guide (`docs/social-auth-setup.md`)
- [x] Updated README with Supabase information
- [x] Environment variables already configured (`.env` file exists)

## 🧪 Next Steps - Testing Required

### 1. Test Sign Up Flow
- [ ] Run `npm run dev`
- [ ] Navigate to `/sign-up`
- [ ] Enter name, email, and password
- [ ] Submit form
- [ ] **Expected**: Success toast and redirect to dashboard OR email verification prompt (depends on Supabase settings)

**Troubleshooting**:
- If email verification is required, check Supabase Dashboard → Authentication → Users for the verification link
- If error occurs, check browser console for details

### 2. Test Email Verification (if enabled)
- [ ] After signup, check email for verification link
- [ ] Click verification link
- [ ] **Expected**: Email verified, can now sign in

**Configuration**:
- To disable email verification (dev only): Supabase Dashboard → Authentication → Settings → Uncheck "Enable email confirmations"

### 3. Test Sign In Flow
- [ ] Navigate to `/sign-in`
- [ ] Enter registered email and password
- [ ] Submit form
- [ ] **Expected**: Success toast and redirect to dashboard
- [ ] Verify user data appears in nav/settings

**Troubleshooting**:
- If "Invalid login credentials" error, ensure email is verified (if required)
- Check Supabase Dashboard → Authentication → Users to see user status

### 4. Test Protected Routes
- [ ] While signed in, navigate to `/` (dashboard)
- [ ] **Expected**: Access granted, user data displayed
- [ ] Sign out
- [ ] Try to access `/` or any `/_authenticated` route
- [ ] **Expected**: Redirect to `/sign-in`

### 5. Test Forgot Password Flow
- [ ] Sign out (if signed in)
- [ ] Navigate to `/forgot-password`
- [ ] Enter your email
- [ ] Submit form
- [ ] **Expected**: Success toast "Password reset email sent!"
- [ ] Check email for password reset link
- [ ] Click reset link
- [ ] **Expected**: Redirected to password reset page

**Note**: By default, Supabase redirects to their hosted UI. To customize:
- Supabase Dashboard → Authentication → URL Configuration → Set "Site URL"
- For Electron, you may need to implement deep linking (see `docs/social-auth-setup.md`)

### 6. Test Session Persistence
- [ ] Sign in
- [ ] Close the app completely
- [ ] Reopen the app
- [ ] **Expected**: Still signed in, user data loaded

**Troubleshooting**:
- Check browser localStorage in DevTools → Application → Local Storage
- Should see Supabase session data

### 7. Test Auto Token Refresh
- [ ] Sign in
- [ ] Leave app open for 1+ hours
- [ ] Try to access protected route or perform auth operation
- [ ] **Expected**: Session automatically refreshed, no re-login required

## 🔧 Supabase Dashboard Configuration

### Required Settings
- [ ] **Email Provider Enabled**: Authentication → Providers → Email (should be enabled)
- [ ] **Email Confirmation**: Authentication → Settings → Enable email confirmations (choose based on your needs)
- [ ] **Site URL**: Authentication → URL Configuration → Set to your app's URL
  - Dev: `http://localhost:5173` or your dev server URL
  - Prod: Your production URL or custom protocol (e.g., `yourapp://`)

### Optional Settings
- [ ] **Social Providers**: Enable GitHub, Facebook, etc. (see `docs/social-auth-setup.md`)
- [ ] **Password Requirements**: Authentication → Settings → Minimum password length
- [ ] **Rate Limiting**: Authentication → Settings → Configure rate limits
- [ ] **Email Templates**: Authentication → Email Templates → Customize emails

## 🔍 Verification Checklist

### Environment Variables
- [ ] `.env` file exists with correct Supabase credentials
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] Values match your Supabase project (Settings → API)

### Code Integration
- [ ] Supabase client initialized in `src/renderer/src/lib/supabase.ts`
- [ ] Auth store using Supabase methods (not IPC)
- [ ] Auth state listener in `__root.tsx`
- [ ] Protected routes checking Supabase session
- [ ] Forms calling auth store methods

### Browser DevTools Checks
When app is running, open DevTools (F12) and check:
- [ ] **Console**: No errors related to Supabase
- [ ] **Network**: Supabase API calls visible (after auth operations)
- [ ] **Application → Local Storage**: Supabase session data after sign-in
- [ ] **Application → Local Storage**: Session persists after app restart

## 🧹 Cleanup Tasks (Do After Testing)

Only proceed with cleanup after confirming Supabase auth works completely.

### Remove Old Local Auth System
- [ ] Delete `src/main/services/auth.service.ts`
- [ ] Remove IPC auth handlers from `src/main/index.ts`
- [ ] Remove auth API from `src/preload/index.ts`
- [ ] Remove auth types from `src/preload/index.d.ts`
- [ ] Uninstall unused packages:
  ```bash
  npm uninstall bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken electron-store
  ```

### Database Schema Cleanup
Consider whether to keep or remove local auth tables:

**Option A: Remove Sessions Table**
- [ ] Remove `sessionsTable` from `src/main/db/schema.ts`
- [ ] Generate migration: `npm run db:generate`
- [ ] Reasoning: Supabase handles sessions now

**Option B: Keep Users Table for App Data**
- [ ] Keep `usersTable` but remove auth fields (passwordHash, etc.)
- [ ] Add `supabaseId` field to link to Supabase auth.users
- [ ] Use for app-specific user data (preferences, settings, etc.)

**Option C: Full Cleanup**
- [ ] Remove both `usersTable` and `sessionsTable`
- [ ] Use Supabase for all user data
- [ ] Generate migration: `npm run db:generate`

## 📊 Success Criteria

Your Supabase integration is successful when:
- ✅ Users can sign up and receive confirmation (if enabled)
- ✅ Users can sign in with email/password
- ✅ Protected routes redirect when not authenticated
- ✅ User data displays correctly in UI
- ✅ Sessions persist across app restarts
- ✅ Password reset emails are sent
- ✅ No TypeScript or runtime errors
- ✅ Auth state updates automatically across the app

## 🐛 Common Issues & Solutions

### Issue: "Invalid API key"
**Solution**: Check `.env` file has correct `VITE_SUPABASE_ANON_KEY`

### Issue: "Email not confirmed"
**Solution**: 
1. Check email for confirmation link, OR
2. Disable email confirmation in Supabase settings, OR
3. Manually confirm in Supabase Dashboard → Authentication → Users

### Issue: "Session not persisting"
**Solution**: 
1. Check localStorage in DevTools
2. Verify `persistSession: true` in `supabase.ts`
3. Ensure no browser extensions blocking localStorage

### Issue: "OAuth buttons don't work"
**Solution**: OAuth requires additional setup - see `docs/social-auth-setup.md`

### Issue: "Password reset link goes to Supabase URL"
**Solution**: Configure "Site URL" in Supabase Dashboard → Authentication → URL Configuration

## 📝 Notes

- The old IPC-based auth is still in the code but not being used
- Clean up only after thorough testing
- Keep a backup before deleting old code
- Social auth (GitHub/Facebook buttons) needs additional setup
- Email templates can be customized in Supabase Dashboard
- For production, configure SMTP in Supabase for reliable email delivery

## ✅ Final Validation

Before considering migration complete:
- [ ] All tests in this checklist pass
- [ ] App runs without errors
- [ ] Authentication works end-to-end
- [ ] User experience is smooth
- [ ] Documentation is accurate
- [ ] Team members can set up locally using README

---

**Migration Status**: ✅ INTEGRATION COMPLETE - TESTING REQUIRED

**Next Action**: Run the app and work through the testing checklist above.
