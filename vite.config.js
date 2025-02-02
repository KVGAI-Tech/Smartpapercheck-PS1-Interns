import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    include: ['@pdftron/webviewer'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Content-Security-Policy': [
        "default-src 'self' blob: data: https://*.pdftron.com https://*.cloudflare.com https://jsonplaceholder.typicode.com;",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://*.pdftron.com https://*.cloudflare.com cdnjs.cloudflare.com;",
        "worker-src 'self' blob: cdnjs.cloudflare.com;",
        "style-src 'self' 'unsafe-inline';",
        "font-src 'self' data:;",
        "img-src 'self' blob: data:;",
        "connect-src 'self' blob: https://*.pdftron.com https://*.cloudflare.com cdnjs.cloudflare.com https://jsonplaceholder.typicode.com;",
        "frame-src 'self' blob:;"
      ].join(' ')
    },
    fs: {
      strict: false,
      allow: ['.']
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          webviewer: ['@pdftron/webviewer']
        }
      }
    },
    commonjsOptions: {
      include: [/@pdftron\/webviewer/, /node_modules/],
      transformMixedEsModules: true
    }
  }
});