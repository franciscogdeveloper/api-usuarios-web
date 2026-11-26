/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias `@/` -> `src/` (debe coincidir con "paths" en tsconfig.app.json)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    // En modo "test" Vite no carga .env.development, así que fijamos la URL aquí.
    env: { VITE_API_URL: 'http://localhost:3000/api' },
  },
})
