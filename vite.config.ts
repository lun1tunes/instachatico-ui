import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/chatico/',
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
      '/api': {
        target: 'http://localhost:4291',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
