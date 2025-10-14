import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for Electron
    storage: {
      getItem: (key) => {
        return localStorage.getItem(key)
      },
      setItem: (key, value) => {
        localStorage.setItem(key, value)
      },
      removeItem: (key) => {
        localStorage.removeItem(key)
      },
    },
  },
})

// Types for authenticated user
export interface SupabaseUser {
  id: string
  email: string
  user_metadata: {
    name?: string
    full_name?: string
    avatar_url?: string
  }
}
