import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'

export default defineVitestConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
