import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // ✅ Allow importing images from InnovateHer/Illustrations
  resolve: {
    alias: {
      '@ill': path.resolve(__dirname, '../Illustrations'),
    },
  },

  server: {
    port: 3000,

    // ✅ Allow Vite dev server to read files outside /frontend
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },

    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})