import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load .env files. The dev proxy target comes from VITE_API_URL so the backend
  // URL is NOT hardcoded in this (public) repo. Set it in a local .env file.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['dev.smart-qna.com', 'localhost', 'smartpapercheck.com'],
      fs: {
        allow: [
          path.resolve(__dirname),
          path.resolve(__dirname, '..'),
          path.resolve(__dirname, '..', 'node_modules'),
        ],
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      },
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      },
      hmr:
        process.env.VITE_HMR_HOST || process.env.VITE_HMR_PROTOCOL || process.env.VITE_HMR_CLIENT_PORT
          ? {
              protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
              host: process.env.VITE_HMR_HOST,
              clientPort: process.env.VITE_HMR_CLIENT_PORT
                ? Number(process.env.VITE_HMR_CLIENT_PORT)
                : undefined,
            }
          : undefined,
    },
    preview: {
      port: parseInt(process.env.PORT) || 4173,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
