import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    // Use / in dev so proxy + API calls work, keep /chatico/ for build/preview
    base: isDev ? '/' : '/chatico/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 51074,          // Dev server port (random port for security)
      host: '0.0.0.0',      // Listen on all interfaces (allows external access)
      strictPort: false,    // If port is busy, try next one
      proxy: {
        // Mirror nginx: webhook + token hit service on 8100, data APIs on 4291
        '/token': {
          target: 'http://localhost:8100',
          changeOrigin: true,
          secure: false
        },
        '/api/v1/webhook': {
          target: 'http://localhost:8100',
          changeOrigin: true,
          secure: false
        },
        '/api': {
          target: 'http://localhost:4291',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
