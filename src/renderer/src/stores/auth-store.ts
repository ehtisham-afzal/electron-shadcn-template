import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; message: string }>
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>
  reset: () => void
}

// Helper to convert Supabase user to AuthUser
const toAuthUser = (user: User): AuthUser => ({
  id: user.id,
  name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
  email: user.email || '',
  role: user.user_metadata?.role || 'user'
})

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        set({ isLoading: false })
        return { success: false, message: error.message }
      }

      if (data.user && data.session) {
        const authUser = toAuthUser(data.user)
        
        set({
          user: authUser,
          session: data.session,
          isLoading: false
        })
        return { success: true, message: 'Login successful!' }
      }

      set({ isLoading: false })
      return { success: false, message: 'Login failed' }
    } catch (error) {
      set({ isLoading: false })
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      }
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name
          },
          emailRedirectTo: undefined // Disable email redirect for Electron
        }
      })

      if (error) {
        set({ isLoading: false })
        return { success: false, message: error.message }
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          const authUser = toAuthUser(data.user)
          
          set({
            user: authUser,
            session: data.session,
            isLoading: false
          })
          return { success: true, message: 'Registration successful!' }
        } else {
          set({ isLoading: false })
          return {
            success: true,
            message: 'Registration successful! Please check your email to verify your account.'
          }
        }
      }

      set({ isLoading: false })
      return { success: false, message: 'Registration failed' }
    } catch (error) {
      set({ isLoading: false })
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await supabase.auth.signOut()
      set({ user: null, session: null, isLoading: false })
    } catch (error) {
      console.error('Logout error:', error)
      set({ user: null, session: null, isLoading: false })
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      // First, try to get the session from URL (for OAuth callbacks)
      const { data: { session: urlSession } } = await supabase.auth.getSession()
      
      if (urlSession && urlSession.user) {
        const authUser = toAuthUser(urlSession.user)
        
        set({ user: authUser, session: urlSession, isLoading: false })
        
        // Clean up URL if it contains OAuth parameters
        if (window.location.hash.includes('access_token') || window.location.search.includes('code')) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
        
        return
      }

      // If no session found, check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession()

      if (session && session.user) {
        const authUser = toAuthUser(session.user)
        
        set({ user: authUser, session, isLoading: false })
      } else {
        set({ user: null, session: null, isLoading: false })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      set({ user: null, session: null, isLoading: false })
    }
  },

  sendPasswordReset: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined // Disable redirect for Electron
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send reset email'
      }
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, message: 'Password updated successfully!' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update password'
      }
    }
  },

  verifyOtp: async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) {
        return { success: false, message: error.message }
      }

      if (data.user && data.session) {
        const authUser = toAuthUser(data.user)
        set({ user: authUser, session: data.session })
        return { success: true, message: 'Email verified successfully!' }
      }

      return { success: false, message: 'Verification failed' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed'
      }
    }
  },

  resendOtp: async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, message: 'Verification code sent!' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend code'
      }
    }
  },

  reset: () => {
    set({ user: null, session: null, isLoading: false })
  }
}))

