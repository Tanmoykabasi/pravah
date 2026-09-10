import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA plugin — caches shell + assets so the app survives a network drop
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'siren.wav'],
      manifest: {
        name: 'PRAVAH - Disaster Command Center',
        short_name: 'PRAVAH',
        description:
          'Predictive Runoff Assessment & Vulnerability Alert Hub - Edge-first flood intelligence.',
        theme_color: '#eaf3ff',
        background_color: '#f4faff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache the app shell so the dashboard loads even when the
        // FastAPI simulator is unreachable.
        globPatterns: ['**/*.{js,css,html,svg,wav,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // enable service worker in dev for demo purposes
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy the API + SSE stream so the frontend can hit a single origin
      // and survive offline once cached.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: false,
    target: 'es2020',
  },
});
