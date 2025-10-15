import { ElectronAPI } from '@electron-toolkit/preload'

interface DatabaseAPI {
  initializeUser: (userId: string) => Promise<{ success: boolean; userId?: string; error?: string }>
  closeUser: () => Promise<{ success: boolean; userId?: string | null; error?: string }>
  getCurrentUser: () => Promise<{ userId: string | null }>
}

interface API {
  db: DatabaseAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}

