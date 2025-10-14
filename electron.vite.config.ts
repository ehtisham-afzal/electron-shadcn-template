import path, { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tanstackRouter from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import { cpSync } from 'fs'

// Plugin to copy drizzle migrations to output
function copyDrizzleMigrations() {
  return {
    name: 'copy-drizzle-migrations',
    closeBundle() {
      const migrationsSource = resolve(__dirname, 'drizzle')
      const migrationsTarget = resolve(__dirname, 'out/main/drizzle')
      
      try {
        cpSync(migrationsSource, migrationsTarget, { recursive: true })
        console.log('✓ Copied Drizzle migrations to output')
      } catch (error) {
        console.warn('Could not copy migrations:', error)
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyDrizzleMigrations()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: path.resolve(__dirname, './src/renderer/src/routes'),
        generatedRouteTree: path.resolve(__dirname, './src/renderer/src/routeTree.gen.ts')
      }),
      react(),
      tailwindcss()
    ]
  }
})
