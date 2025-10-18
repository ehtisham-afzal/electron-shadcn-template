import { Link } from '@tanstack/react-router'
import { Signature } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'

export function AppTitle() {
  return (
    <Link to="/">
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border"
      >
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <Signature className="size-4" />
        </div>
        <div className="grid flex-1 text-start text-sm leading-tight relative">
          <span className="truncate font-semibold overflow-visible text-lg">Ledgerly</span>
          <Badge variant='outline' className='absolute -top-1 left-18 rounded-none'>Beta</Badge>
        </div>
      </SidebarMenuButton>
    </Link>
  )
}
