import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://dbmsapi.parteekbhatia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // In case of self-signed certs (dev only)
      },
      // Also proxy specific endpoints that may not be prefixed with /api if needed
      '/auth': {
        target: 'https://dbmsapi.parteekbhatia.com',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'https://dbmsapi.parteekbhatia.com',
        changeOrigin: true,
        secure: false,
      },
      '/notes': {
        target: 'https://dbmsapi.parteekbhatia.com',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})