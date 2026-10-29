import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * `npm run dev` serves the Vercel-style handlers in api/*.ts, so the AI advisor and the
 * Geodesis Agent work locally without `vercel dev`. Keys come from .env.local.
 */
function devApiRoutes(): Plugin {
  return {
    name: 'geodesis-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = /^\/api\/([a-z0-9-]+)(?:\?.*)?$/i.exec(req.url ?? '');
        if (!match) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const raw = Buffer.concat(chunks).toString('utf8');
          let body: unknown = raw;
          try {
            body = raw ? JSON.parse(raw) : {};
          } catch {
            // leave as the raw string; handlers validate their own input
          }
          const vercelRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code;
              return vercelRes;
            },
            json(data: unknown) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return vercelRes;
            },
          });
          await mod.default(Object.assign(req, { body, query: {} }), vercelRes);
        } catch (err) {
          server.config.logger.error(`dev api ${req.url}: ${err instanceof Error ? err.message : String(err)}`);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
          }
          if (!res.writableEnded) res.end(JSON.stringify({ error: 'dev_api_error' }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devApiRoutes()],

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
