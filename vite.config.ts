import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@context': resolve(__dirname, 'src/context'),
      '@types': resolve(__dirname, 'src/types'),
      '@data': resolve(__dirname, 'src/data'),
      '@integrations': resolve(__dirname, 'src/integrations'),
    },
  },

  server: {
    port: 3000,
    open: false,
  },

  preview: {
    port: 4173,
  },

  build: {
    // Raise warning threshold — our single-page app is inherently large
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting to reduce initial load
        manualChunks: {
          // React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Map library
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Charts
          'vendor-recharts': ['recharts'],
          // Animation
          'vendor-framer': ['framer-motion'],
          // Utilities
          'vendor-utils': ['date-fns', 'lucide-react', 'sonner'],
        },
      },
    },

    // Target modern browsers only (reduces polyfill size)
    target: 'es2020',

    // Source maps in production for error tracking (comment out if not using Sentry)
    sourcemap: false,
  },
});
