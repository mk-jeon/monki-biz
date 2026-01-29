import { defineConfig } from 'vite'
import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server/cloudflare'

export default defineConfig({
  plugins: [
    build({
      entry: 'src/index.tsx',
      minify: true
    }),
    devServer({
      entry: 'src/index.tsx'
    })
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
