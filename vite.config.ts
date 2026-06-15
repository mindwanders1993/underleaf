/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Underleaf',
        short_name: 'Underleaf',
        description:
          'Local-first, browser-based LaTeX resume builder. Compiles in the browser via WASM.',
        theme_color: '#6EE7B7',
        background_color: '#0A0E1A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,wasm,mjs,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024, // accommodates pdf.worker
        runtimeCaching: [
          {
            urlPattern: /\/swiftlatex\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'underleaf-swiftlatex',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // keep dev quiet; opt-in if you want to test SW locally
      },
    }),
  ],
  server: {
    // SwiftLaTeX uses SharedArrayBuffer; cross-origin isolation headers required.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
  },
})
