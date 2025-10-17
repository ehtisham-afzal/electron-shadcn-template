import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  GalleryVerticalEnd,
  Signature
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Ihtisham Afzal',
    email: 'shaminterprise@gmail.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Ledgerly',
      logo: Signature,
      plan: 'Professional'
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    }
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard
        },
        {
          title: 'Sale',
          items: [
            {
              title: 'New Invoice',
              url: '/items/sale',
              icon: ListTodo
            }
          ],
          icon: Package
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users
        }
      ]
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in'
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2'
            },
            {
              title: 'Sign Up',
              url: '/sign-up'
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password'
            },
            {
              title: 'OTP',
              url: '/otp'
            }
          ]
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction
            }
          ]
        }
      ]
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          url: '/settings'
          // items: [
          //   {
          //     title: 'Profile',
          //     url: '/settings',
          //     icon: UserCog
          //   },
          //   {
          //     title: 'Account',
          //     url: '/settings/account',
          //     icon: Wrench
          //   },
          //   {
          //     title: 'Appearance',
          //     url: '/settings/appearance',
          //     icon: Palette
          //   },
          //   {
          //     title: 'Notifications',
          //     url: '/settings/notifications',
          //     icon: Bell
          //   },
          //   {
          //     title: 'Display',
          //     url: '/settings/display',
          //     icon: Monitor
          //   }
          // ]
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle
        }
      ]
    }
  ]
}
