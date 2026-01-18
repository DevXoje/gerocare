import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// Detectar si corre en Docker para configurar el host correctamente
// Escucha en 0.0.0.0 solo en Docker o cuando se especifica explícitamente
// Por defecto usa localhost para mayor seguridad en desarrollo local
const isDocker = existsSync('/.dockerenv') || process.env.DOCKER_CONTAINER === 'true'
const host = process.env.VITE_HOST || (isDocker ? '0.0.0.0' : 'localhost')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host,
    port: 5173,
  },
})
