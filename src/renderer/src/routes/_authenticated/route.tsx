import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: async ({ location }) => {
    // Check if user is authenticated using Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Redirect to sign-in with the intended destination
      throw redirect({
        to: '/sign-in-2',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})
