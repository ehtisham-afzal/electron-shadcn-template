import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import type { Provider } from '@supabase/supabase-js'

interface SignInWithOAuthButtonProps {
  provider: Provider
  icon?: React.ReactNode
  children?: React.ReactNode
  redirectTo?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function SignInWithOAuthButton({
  provider,
  icon,
  children,
  redirectTo = '/',
  variant = 'outline',
  className,
  size,
  disabled = false,
  onSuccess,
  onError
}: SignInWithOAuthButtonProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && isLoading) {
        setIsLoading(false)
        toast.success('Successfully signed in!')
        
        if (onSuccess) {
          onSuccess()
        }
        
        navigate({ to: redirectTo, replace: true })
      } else if (event === 'SIGNED_OUT') {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, redirectTo, isLoading, onSuccess])

  async function handleOAuthSignIn() {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: false
        }
      })

      if (error) {
        setIsLoading(false)
        toast.error(error.message || `Failed to sign in with ${provider}`)
        
        if (onError) {
          onError(error)
        }
      }
    } catch (error) {
      setIsLoading(false)
      const err = error as Error
      toast.error('An unexpected error occurred')
      console.error(`${provider} sign-in error:`, error)
      
      if (onError) {
        onError(err)
      }
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      size={size}
      type="button"
      disabled={disabled || isLoading}
      onClick={handleOAuthSignIn}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </Button>
  )
}
